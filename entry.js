import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { standardData } from "./standardData.js";

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

const el = id => document.getElementById(id);
const BAG_WEIGHT_KG = 50;

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

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

  const totalChicks = farmerSnap.data().totalChicks;
  const startDate = new Date(farmerSnap.data().batchStartDate);

  const today = new Date();
  const todayAge =
    Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const daySelect = el("daySelect");

  // Populate day list
  for (let i = 1; i <= todayAge; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = "Day " + i;
    daySelect.appendChild(opt);
  }
  daySelect.value = todayAge;

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
      el("mortalityDaily").value = snap.data().mortalityDaily;
      el("feedReceived").value = snap.data().feedReceived;
      el("feedUsed").value = snap.data().feedUsed;
      el("bodyWtActual").value = snap.data().bodyWtActual;
    } else {
      el("mortalityDaily").value = "";
      el("feedReceived").value = "";
      el("feedUsed").value = "";
      el("bodyWtActual").value = "";
    }

    el("saveDay").onclick = async () => {
      const mortDaily = Number(el("mortalityDaily").value || 0);
      const feedRecBags = Number(el("feedReceived").value || 0);
      const feedUsedBags = Number(el("feedUsed").value || 0);



      // Convert bags → kg
      const feedRecKg = feedRecBags * BAG_WEIGHT_KG;
      const feedUsedKg = feedUsedBags * BAG_WEIGHT_KG;

      const bwAct = Number(el("bodyWtActual").value || 0);

      const mortTotal = prevMort + mortDaily;
      const mortPct = ((mortTotal / totalChicks) * 100).toFixed(2);
      const feedBalKg = prevFeedBal + feedRecKg - feedUsedKg;
      const cumFeedAct = prevCumFeed + feedUsedKg * 1000;



      const fcrAct = bwAct
        ? ((cumFeedAct / 1000) / (bwAct / 1000)).toFixed(2)
        : 0;

      const std = standardData[age] || {};

      // Display
      el("mortTotal").innerText = mortTotal;
      el("mortPct").innerText = mortPct;
      el("feedBal").innerText = (feedBalKg / 50).toFixed(1) + " bags";
      el("fiStd").innerText = std.feedIntake || "-";
      el("fiAct").innerText = ((feedUsedKg * 1000) / (totalChicks - mortTotal)).toFixed(2);
      el("cumStd").innerText = std.cumFeed || "-";
      el("cumAct").innerText = cumFeedAct;
      el("bwMin").innerText = std.bodyWt || "-";
      el("fcrStd").innerText = std.fcr || "-";
      el("fcrAct").innerText = fcrAct;

 await setDoc(ref, {
  date: new Date(),
  age,

  mortalityDaily: mortDaily,
  mortalityTotal: mortTotal,
  mortalityPct: mortPct,

  feedReceived: feedRecKg,   // ✅ KG
  feedUsed: feedUsedKg,      // ✅ KG
  feedBalance: feedBalKg,    // ✅ KG

  feedIntakeStd: std.feedIntake,
  feedIntakeActual: el("fiAct").innerText,

  cumFeedStd: std.cumFeed,
  cumFeedActual: cumFeedAct,

  bodyWtMin: std.bodyWt,
  bodyWtActual: bwAct,

  fcrStd: std.fcr,
  fcrActual: fcrAct
}, { merge: true });


      alert("Saved");
    };
  }

  loadDay(todayAge);
  daySelect.onchange = () => loadDay(Number(daySelect.value));
});
