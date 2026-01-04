import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { standardData } from "./standardData.js";

/* ---------------- FIREBASE CONFIG ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyDHnDFe-sg7hc4I8jSEHR7wIlHUnLfUA8A",
  authDomain: "poultry-record.firebaseapp.com",
  projectId: "poultry-record",
  storageBucket: "poultry-record.firebasestorage.app",
  messagingSenderId: "476624930714",
  appId: "1:476624930714:web:d7847899b8e1f3eb4d5c23"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------------- HELPERS ---------------- */
const el = id => document.getElementById(id);
const BAG_WEIGHT_KG = 50;

/* ---------------- AUTH ---------------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
 
  /* -------- Farmer data -------- */
  const farmerRef = doc(db, "farmers", user.uid);
  const farmerSnap = await getDoc(farmerRef);

  if (
    !farmerSnap.exists() ||
    !farmerSnap.data().batchStartDate ||
    !farmerSnap.data().totalChicks
  ) {
    window.location.href = "setup.html";
    return;
  }

  const farmerTotalChicks = farmerSnap.data().totalChicks;

  /* -------- Safe date parse -------- */
  const [y, m, d] = farmerSnap.data().batchStartDate.split("-");
  const startDate = new Date(y, m - 1, d);

  const today = new Date();
  const todayAge =
    Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const safeTodayAge = Math.max(1, todayAge);

  /* -------- Day dropdown -------- */
  const daySelect = el("daySelect");
  daySelect.innerHTML = "";

  for (let i = 1; i <= safeTodayAge; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = "Day " + i;
    daySelect.appendChild(opt);
  }

  daySelect.value = safeTodayAge;

  /* ================= RECALCULATION LOGIC ================= */
  async function recalculateFromDay(startAge) {
    let runningBalance = 0;
    let runningCumFeed = 0;
    let runningMortTotal = 0;

    // Build state till previous day
    for (let d = 1; d < startAge; d++) {
      const snap = await getDoc(
        doc(db, "farmers", user.uid, "dailyRecords", `day_${d}`)
      );
      if (!snap.exists()) continue;

      const data = snap.data();
      runningBalance = data.feedBalance || runningBalance;
      runningCumFeed = data.cumFeedActual || runningCumFeed;
      runningMortTotal = data.mortalityTotal || runningMortTotal;
    }

    // Recalculate from edited day forward
    for (let d = startAge; ; d++) {
      const ref = doc(db, "farmers", user.uid, "dailyRecords", `day_${d}`);
      const snap = await getDoc(ref);
      if (!snap.exists()) break;

      const data = snap.data();

      runningMortTotal += data.mortalityDaily || 0;
      const liveBirds = farmerTotalChicks - runningMortTotal;

      runningBalance =
        runningBalance +
        (data.feedReceived || 0) -
        (data.feedUsed || 0);

      const fiAct =
        liveBirds > 0
          ? (data.feedUsed * 1000) / liveBirds
          : 0;

      runningCumFeed += fiAct;

      const bw = data.bodyWtActual || 0;
      const fcrAct =
        bw > 0
          ? ((runningCumFeed / 1000) / (bw / 1000)).toFixed(2)
          : 0;

      await setDoc(ref, {
        feedBalance: runningBalance,
        feedIntakeActual: Number(fiAct.toFixed(2)),
        cumFeedActual: Number(runningCumFeed.toFixed(2)),
        fcrActual: fcrAct
      }, { merge: true });
    }
  }

  /* ================= LOAD DAY ================= */
  async function loadDay(age) {
    el("dayInfo").innerText = "Day " + age;

    const prevRef = age > 1
      ? doc(db, "farmers", user.uid, "dailyRecords", `day_${age - 1}`)
      : null;

    const prevSnap = prevRef ? await getDoc(prevRef) : null;

    const prevMort = prevSnap?.data()?.mortalityTotal || 0;
    const prevFeedBal = prevSnap?.data()?.feedBalance || 0;
    const prevCumFeed = prevSnap?.data()?.cumFeedActual || 0;

    const ref = doc(db, "farmers", user.uid, "dailyRecords", `day_${age}`);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      el("mortalityDaily").value = snap.data().mortalityDaily || "";
      el("feedReceived").value = (snap.data().feedReceived || 0) / BAG_WEIGHT_KG;
      el("feedUsed").value = (snap.data().feedUsed || 0) / BAG_WEIGHT_KG;
      el("bodyWtActual").value = snap.data().bodyWtActual || "";
    } else {
      el("mortalityDaily").value = "";
      el("feedReceived").value = "";
      el("feedUsed").value = "";
      el("bodyWtActual").value = "";
    }

    /* ================= SAVE ================= */
    el("saveDay").onclick = async () => {
      const mortDaily = Number(el("mortalityDaily").value || 0);
      const feedRecBags = Number(el("feedReceived").value || 0);
      const feedUsedBags = Number(el("feedUsed").value || 0);
      const bwAct = Number(el("bodyWtActual").value || 0);

      const feedRecKg = feedRecBags * BAG_WEIGHT_KG;
      const feedUsedKg = feedUsedBags * BAG_WEIGHT_KG;

      const mortTotal = prevMort + mortDaily;
      const mortPct = ((mortTotal / farmerTotalChicks) * 100).toFixed(2);

      const feedBalKg = prevFeedBal + feedRecKg - feedUsedKg;

      const liveBirds = farmerTotalChicks - mortTotal;
      const fiAct =
        liveBirds > 0
          ? (feedUsedKg * 1000) / liveBirds
          : 0;

      const cumFeedAct = prevCumFeed + fiAct;

      const fcrAct =
        bwAct > 0
          ? ((cumFeedAct / 1000) / (bwAct / 1000)).toFixed(2)
          : 0;

      const std = standardData[age] || {};

      await setDoc(ref, {
        date: new Date(),
        age,

        mortalityDaily: mortDaily,
        mortalityTotal: mortTotal,
        mortalityPct: mortPct,

        feedReceived: feedRecKg,
        feedUsed: feedUsedKg,
        feedBalance: feedBalKg,

        feedIntakeStd: std.feedIntake,
        feedIntakeActual: Number(fiAct.toFixed(2)),

        cumFeedStd: std.cumFeed,
        cumFeedActual: Number(cumFeedAct.toFixed(2)),

        bodyWtMin: std.bodyWt,
        bodyWtActual: bwAct,

        fcrStd: std.fcr,
        fcrActual: fcrAct
      }, { merge: true });

      await recalculateFromDay(age);

      alert("Saved & recalculated successfully");
    };
  }

  loadDay(safeTodayAge);
  daySelect.onchange = () => loadDay(Number(daySelect.value));
});
