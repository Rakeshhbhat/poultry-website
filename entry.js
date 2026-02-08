/* ================= IMPORTS ================= */
import "./firebase.js";
import { firebaseApp } from "./firebase.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { standardData } from "./standardData.js";

/* ================= INIT ================= */
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

/* ================= HELPERS ================= */
const el = id => document.getElementById(id);
const BAG_WEIGHT_KG = 50;

/* ================= UI UPDATE ================= */
function updateCalculatedUI({
  mortTotal,
  mortPct,
  feedBalKg,
  fiAct,
  cumFeedAct,
  fcrAct,
  std
}) {
  el("mortTotal").innerText = mortTotal;
  el("mortPct").innerText = mortPct + "%";

  el("feedBal").innerText =
    (feedBalKg / BAG_WEIGHT_KG).toFixed(1) + " bags";

  el("fiStd").innerText = std.feedIntake ?? "-";
  el("fiAct").innerText = fiAct.toFixed(2);

  el("cumStd").innerText = std.cumFeed ?? "-";
  el("cumAct").innerText = cumFeedAct.toFixed(2);

  el("bwMin").innerText = std.bodyWt ?? "-";
  el("fcrStd").innerText = std.fcr ?? "-";
  el("fcrAct").innerText = fcrAct;
}

/* ================= AUTH ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  /* -------- ACTIVE BATCH -------- */
  const batchId = localStorage.getItem("activeBatchId");
  if (!batchId) {
    window.location.href = "batch.html";
    return;
  }

  /* -------- BATCH DATA -------- */
  const batchRef = doc(
    db,
    "farmers",
    user.uid,
    "batches",
    batchId
  );

  const batchSnap = await getDoc(batchRef);

  if (!batchSnap.exists()) {
    alert("Selected batch not found");
    window.location.href = "batch.html";
    return;
  }

  const batch = batchSnap.data();
  const totalChicks = batch.totalChicks;

  /* -------- START DATE -------- */
  const [y, m, d] = batch.batchStartDate.split("-");
  const startDate = new Date(y, m - 1, d);

  const today = new Date();
  const todayAge =
    Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const safeTodayAge = Math.max(1, todayAge);

  /* -------- DAY DROPDOWN -------- */
  const daySelect = el("daySelect");
  daySelect.innerHTML = "";

  for (let i = 1; i <= safeTodayAge; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = "Day " + i;
    daySelect.appendChild(opt);
  }

  daySelect.value = safeTodayAge;

  /* ================= RECALCULATE FORWARD ================= */
  async function recalculateFromDay(startAge) {
    let runningFeedBal = 0;
    let runningCumFeed = 0;
    let runningMortTotal = 0;

    for (let d = 1; d < startAge; d++) {
      const snap = await getDoc(
        doc(
          db,
          "farmers",
          user.uid,
          "batches",
          batchId,
          "dailyRecords",
          `day_${d}`
        )
      );

      if (!snap.exists()) continue;

      const data = snap.data();
      runningFeedBal = data.feedBalance ?? runningFeedBal;
      runningCumFeed = data.cumFeedActual ?? runningCumFeed;
      runningMortTotal = data.mortalityTotal ?? runningMortTotal;
    }

    for (let d = startAge; ; d++) {
      const ref = doc(
        db,
        "farmers",
        user.uid,
        "batches",
        batchId,
        "dailyRecords",
        `day_${d}`
      );

      const snap = await getDoc(ref);
      if (!snap.exists()) break;

      const data = snap.data();

      runningMortTotal += data.mortalityDaily || 0;
      const liveBirds = totalChicks - runningMortTotal;

      runningFeedBal =
        runningFeedBal +
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
        feedBalance: runningFeedBal,
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
      ? doc(
          db,
          "farmers",
          user.uid,
          "batches",
          batchId,
          "dailyRecords",
          `day_${age - 1}`
        )
      : null;

    const prevSnap = prevRef ? await getDoc(prevRef) : null;

    const prevMort = prevSnap?.data()?.mortalityTotal || 0;
    const prevFeedBal = prevSnap?.data()?.feedBalance || 0;
    const prevCumFeed = prevSnap?.data()?.cumFeedActual || 0;

    const ref = doc(
      db,
      "farmers",
      user.uid,
      "batches",
      batchId,
      "dailyRecords",
      `day_${age}`
    );

    const snap = await getDoc(ref);

    if (snap.exists()) {
      el("mortalityDaily").value = snap.data().mortalityDaily || "";
      el("feedReceived").value =
        (snap.data().feedReceived || 0) / BAG_WEIGHT_KG;
      el("feedUsed").value =
        (snap.data().feedUsed || 0) / BAG_WEIGHT_KG;
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
      const feedRecKg =
        Number(el("feedReceived").value || 0) * BAG_WEIGHT_KG;
      const feedUsedKg =
        Number(el("feedUsed").value || 0) * BAG_WEIGHT_KG;
      const bwAct = Number(el("bodyWtActual").value || 0);

      const mortTotal = prevMort + mortDaily;
      const mortPct = ((mortTotal / totalChicks) * 100).toFixed(2);

      const feedBalKg = prevFeedBal + feedRecKg - feedUsedKg;

      const liveBirds = totalChicks - mortTotal;
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

      updateCalculatedUI({
        mortTotal,
        mortPct,
        feedBalKg,
        fiAct,
        cumFeedAct,
        fcrAct,
        std
      });

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

      alert("Saved successfully");
    };
  }

  loadDay(safeTodayAge);
  daySelect.onchange = () =>
    loadDay(Number(daySelect.value));
});
