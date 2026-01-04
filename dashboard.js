import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDHnDFe-sg7hc4I8jSEHR7wIlHUnLfUA8A",
  authDomain: "poultry-record.firebaseapp.com",
  projectId: "poultry-record",
  storageBucket: "poultry-record.firebasestorage.app",
  messagingSenderId: "476624930714",
  appId: "1:476624930714:web:d7847899b8e1f3eb4d5c23"
};

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

  const TAB_KEY = "poultry_active_tab";

  if (localStorage.getItem(TAB_KEY)) {
    alert("This app is already open in another tab.\nPlease use that tab.");
    window.location.href = "about:blank";
    return;
  }

  localStorage.setItem(TAB_KEY, Date.now());

  window.addEventListener("beforeunload", () => {
    localStorage.removeItem(TAB_KEY);
  });
  
  const farmerRef = doc(db, "farmers", user.uid);
  const farmerSnap = await getDoc(farmerRef);

  if (!farmerSnap.exists()) {
    window.location.href = "setup.html";
    return;
  }

  const farmerData = farmerSnap.data();

  /* ================= SETUP VALIDATION (SAFE FOR OLD USERS) ================= */
  const hasOldSetup =
    farmerData.batchStartDate &&
    farmerData.totalChicks;

  const hasNewSetup =
    farmerData.farmerName &&
    farmerData.hatcheryName &&
    farmerData.hatcheryCode &&
    farmerData.batchCode;

  if (!hasOldSetup && !hasNewSetup) {
    alert("Please complete batch setup details");
    window.location.href = "setup.html";
    return;
  }

  /* ================= BASIC DATA ================= */
  const totalChicks = farmerData.totalChicks;
  batchStartDate = new Date(farmerData.batchStartDate);

  farmerName = farmerData.farmerName || "—";
  hatcheryName = farmerData.hatcheryName || "—";
  hatcheryCode = farmerData.hatcheryCode || "—";
  batchCode = farmerData.batchCode || "—";

  /* ================= DAILY RECORDS ================= */
  const snap = await getDocs(
    collection(db, "farmers", user.uid, "dailyRecords")
  );

  rows = [];
  snap.forEach(d => rows.push(d.data()));
  rows.sort((a, b) => a.age - b.age);

  if (rows.length === 0) {
    alert("No daily data available yet");
    return;
  }

  const last = rows[rows.length - 1];

  /* ================= KPIs ================= */
  document.getElementById("liveBirds").innerText =
    totalChicks - last.mortalityTotal;

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

  const labels = rows.map(r => "Day " + r.age);

  /* ================= CHARTS ================= */
  new Chart(document.getElementById("bwChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "BW Actual", data: rows.map(r => r.bodyWtActual) },
        { label: "BW Std", data: rows.map(r => r.bodyWtMin) }
      ]
    }
  });

  new Chart(document.getElementById("fcrChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "FCR Actual", data: rows.map(r => r.fcrActual) },
        { label: "FCR Std", data: rows.map(r => r.fcrStd) }
      ]
    }
  });

  new Chart(document.getElementById("mortChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Mortality %", data: rows.map(r => r.mortalityPct) }
      ]
    }
  });
});

/* ================= LOGOUT ================= */
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

/* ================= DASHBOARD PDF ================= */
document.getElementById("pdfBtn").onclick = async () => {
  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF("p", "mm", "a4");

  pdf.setFontSize(12);
  pdf.text(`Farmer : ${farmerName}`, 14, 10);
  pdf.text(`Hatchery : ${hatcheryName} (${hatcheryCode})`, 14, 16);
  pdf.text(`Batch : ${batchCode}`, 14, 22);

  const canvas = await html2canvas(
    document.getElementById("pdfContent"),
    { scale: 2 }
  );

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 28, 210, 260);
  pdf.save("Poultry_Dashboard_Report.pdf");
};

/* ================= DAILY POULTRY CHART PDF ================= */
document.getElementById("chartPdfBtn").onclick = async () => {
  if (!rows || rows.length === 0) {
    alert("No daily data available");
    return;
  }

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF("l", "mm", "a4");

  pdf.setFontSize(14);
  pdf.text("BROILER PERFORMANCE RECORD", 14, 10);

  pdf.setFontSize(10);
  pdf.text(`Farmer Name : ${farmerName}`, 14, 16);
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

  const body = rows.map(r => {
    const d = new Date(batchStartDate);
    d.setDate(d.getDate() + (r.age - 1));

    return [
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
    ];
  });

  pdf.autoTable({
    head: headers,
    body,
    startY: 34,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [0, 0, 0],
      lineColor: [80, 80, 80],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [255, 193, 7],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center"
    },
    alternateRowStyles: {
      fillColor: [255, 249, 196]
    },
    bodyStyles: {
      halign: "center"
    },
    theme: "grid"
  });

  pdf.save("Daily_Performance.pdf");
};
