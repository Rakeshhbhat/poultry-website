/* ================= IMPORTS ================= */
import "./firebase.js";
import { firebaseApp } from "./firebase.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= INIT ================= */
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

let authChecked = false;

/* ================= GLOBAL ================= */
let rows = [];
let batchStartDate;

let farmerName = "";
let hatcheryName = "";
let hatcheryCode = "";
let batchCode = "";

/* ================= AUTH + DATA LOAD ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

 // ✅ AUTH IS CONFIRMED HERE
  authChecked = true;

  /* -------- ACTIVE BATCH -------- */
  const batchId = localStorage.getItem("activeBatchId");

  if (!batchId) {
    window.location.href = "batch.html";
    return;
  }


  /* -------- FARMER -------- */
  const farmerRef = doc(db, "farmers", user.uid);
  const farmerSnap = await getDoc(farmerRef);

  if (!farmerSnap.exists()) {
    window.location.href = "batch.html";
    return;
  }

 farmerName = farmerSnap.data().farmerName || "—";

  /* -------- BATCH -------- */
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

  hatcheryName = batch.hatcheryName || "—";
  hatcheryCode = batch.hatcheryCode || "—";
  batchCode = batch.batchCode || "—";
  batchStartDate = new Date(batch.batchStartDate);
  const totalChicks = batch.totalChicks;

  /* -------- DAILY RECORDS -------- */
  const snap = await getDocs(
    collection(
      db,
      "farmers",
      user.uid,
      "batches",
      batchId,
      "dailyRecords"
    )
  );

  rows = [];
  snap.forEach(d => rows.push(d.data()));
  rows.sort((a, b) => a.age - b.age);

  if (rows.length === 0) {
    alert("No daily data available yet");
    return;
  }

  const last = rows[rows.length - 1];

  /* -------- BILLS / LIFTING DATA -------- */
  const billsSnap = await getDocs(
    collection(db, "farmers", user.uid, "batches", batchId, "bills")
  );

  let totalBirdsSold = 0;
  let totalNetWeightSold = 0;

  billsSnap.forEach(doc => {
    const b = doc.data();
    totalBirdsSold += (b.totalBirds || 0);
    totalNetWeightSold += (b.netWeight || 0);
  });

  /* ================= KPIs ================= */
  document.getElementById("liveBirds").innerText =
    totalChicks - last.mortalityTotal - totalBirdsSold;

  document.getElementById("mortPct").innerText =
    last.mortalityPct + "%";

  document.getElementById("bwAct").innerText =
    last.bodyWtActual;

  document.getElementById("bwStd").innerText =
    last.bodyWtMin;

  document.getElementById("fcrAct").innerText =
    last.fcrActual;

  document.getElementById("fcrStd").innerText =
    last.fcrStd;

  // Update Lifting Stats if elements exist
  const elBirdsSold = document.getElementById("birdsSold");
  if (elBirdsSold) elBirdsSold.innerText = totalBirdsSold;

  const elNetWt = document.getElementById("netWeightSold");
  if (elNetWt) elNetWt.innerText = totalNetWeightSold.toFixed(2);

  const labels = rows.map(r => "Day " + r.age);

  
  /* ================= CHARTS ================= */
  new Chart(document.getElementById("bwChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "BW Actual",
          data: rows.map(r => r.bodyWtActual)
        },
        {
          label: "BW Std",
          data: rows.map(r => r.bodyWtMin)
        }
      ]
    }
  });

  new Chart(document.getElementById("fcrChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "FCR Actual",
          data: rows.map(r => r.fcrActual)
        },
        {
          label: "FCR Std",
          data: rows.map(r => r.fcrStd)
        }
      ]
    }
  });

  new Chart(document.getElementById("mortChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Mortality %",
          data: rows.map(r => r.mortalityPct)
        }
      ]
    }
  });
});

/* ================= LOGOUT ================= */
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  localStorage.removeItem("activeBatchId");
  window.location.href = "index.html";
};

/* ================= BUILD DAILY CHART PDF ================= */
function buildDailyChartPdf() {
  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF("l", "mm", "a4");

  pdf.setFontSize(14);
  pdf.text("BROILER PERFORMANCE RECORD", 14, 10);

  pdf.setFontSize(10);
  pdf.text(`Farmer : ${farmerName}`, 14, 16);
  pdf.text(`Hatchery : ${hatcheryName} (${hatcheryCode})`, 14, 22);
  pdf.text(`Batch : ${batchCode}`, 14, 28);

  pdf.line(14, 30, 285, 30);

  const headers = [[
    "Date", "Age",
    "Mort D", "Mort T", "Mort %",
    "Feed Rec", "Feed Used", "Feed Bal",
    "FI Std", "FI Act",
    "Cum Std", "Cum Act",
    "BW Min", "BW Act",
    "FCR Std", "FCR Act"
  ]];

  const body = [];

  rows.forEach(r => {
    const d = new Date(batchStartDate);
    d.setDate(d.getDate() + (r.age - 1));

    body.push([
      d.toLocaleDateString("en-IN"),
      r.age,

      r.mortalityDaily,
      r.mortalityTotal,
      r.mortalityPct,

      (r.feedReceived / 50).toFixed(1),
      (r.feedUsed / 50).toFixed(1),
      (r.feedBalance / 50).toFixed(1),

      r.feedIntakeStd,
      r.feedIntakeActual,

      r.cumFeedStd,
      r.cumFeedActual,

      r.bodyWtMin,
      r.bodyWtActual,

      r.fcrStd,
      r.fcrActual
    ]);
  });

  pdf.autoTable({
    head: headers,
    body,
    startY: 34,
    styles: { fontSize: 9, halign: "center" },
    headStyles: { fillColor: [255,193,7], fontStyle: "bold" },
    theme: "grid"
  });

  return pdf;
}

/* ================= VIEW CHART ================= */
document.getElementById("viewChartBtn").onclick = () => {
  const pdf = buildDailyChartPdf();
  window.open(pdf.output("bloburl"), "_blank");
};

/* ================= SHARE CHART ================= */
document.getElementById("shareChartBtn").onclick = async () => {
  const pdf = buildDailyChartPdf();
  const pdfBlob = pdf.output("blob");

  const file = new File(
    [pdfBlob],
    `Daily_Chart_${batchCode}.pdf`,
    { type: "application/pdf" }
  );

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Daily Poultry Chart"
    });
  } else {
    window.open(pdf.output("bloburl"), "_blank");
  }
};
