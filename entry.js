/* ================= IMPORTS ================= */
import { t, translateCommonElements } from "./firebase.js";
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

/* ================= TRANSLATE UI ================= */
translateCommonElements();

// Translate Page Specifics
const labelMap = {
  "mortalityDaily": "Mortality (number of birds died today)",
  "feedReceived": "Feed Received (bags)",
  "feedUsed": "Feed Used (bags)",
  "bodyWtActual": "Average Body Weight (grams)",
  "daySelect": "Select Day" // Label for select
};

for (const [id, key] of Object.entries(labelMap)) {
  const el = document.getElementById(id);
  // Target the label immediately preceding the input
  if (el && el.previousElementSibling && el.previousElementSibling.tagName === "LABEL") {
    el.previousElementSibling.innerText = t(key);
  }
}

document.querySelectorAll(".card h3").forEach(h3 => {
  if(h3.innerText.includes("Inputs")) h3.innerText = t("Inputs");
  if(h3.innerText.includes("Auto Calculated")) h3.innerText = t("Auto Calculated");
});

if(document.getElementById("saveDay")) document.getElementById("saveDay").innerText = t("Save Entry");
if(document.querySelector(".card h2")) document.querySelector(".card h2").innerText = t("Daily Entry");

// Helper to translate <p>Label: <b>...</b></p>
const translateP = (spanId, key) => {
  const span = document.getElementById(spanId);
  if(span && span.closest("p")) {
    span.closest("p").childNodes[0].textContent = t(key) + ": ";
  }
};

translateP("mortTotal", "Mortality Total");
translateP("mortPct", "Mortality %");
translateP("feedBal", "Feed Balance (kg)");
translateP("fiStd", "Feed Intake Std (g)");
translateP("fiAct", "Feed Intake Actual (g)");
translateP("cumStd", "Cum Feed Std (g)");
translateP("cumAct", "Cum Feed Actual (g)");
translateP("bwMin", "Body Wt Min (g)");
translateP("fcrStd", "FCR Std");
translateP("fcrAct", "FCR Actual");

/* ================= INJECT SIDEBAR ACTIONS ================= */
const sidebar = document.querySelector(".sidebar");
if (sidebar && !document.getElementById("viewChartBtn")) {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="sidebar-divider"></div>
    <button id="dashboardBtn" class="nav-item"><i>🏠</i> ${t("Dashboard")}</button>
    <button id="viewChartBtn" class="nav-item"><i>📈</i> ${t("View Chart")}</button>
    <button id="shareChartBtn" class="nav-item"><i>📤</i> ${t("Share Chart")}</button>
  `;
  
  // Insert before Logout button to keep layout consistent
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    sidebar.insertBefore(div, logoutBtn);
  } else {
    sidebar.appendChild(div);
  }

  document.getElementById("dashboardBtn").onclick = () => location.href = "dashboard.html";
  document.getElementById("viewChartBtn").onclick = () => location.href = "dashboard.html?action=viewChart";
  document.getElementById("shareChartBtn").onclick = () => location.href = "dashboard.html?action=shareChart";
}

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
    alert(t("Selected batch not found"));
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
    opt.textContent = t("Day") + " " + i;
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
    el("dayInfo").innerText = t("Day") + " " + age;

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

      alert(t("Saved successfully"));
    };
  }

  loadDay(safeTodayAge);
  daySelect.onchange = () =>
    loadDay(Number(daySelect.value));
});
