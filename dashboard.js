/* ================= IMPORTS ================= */
import { t, translateCommonElements } from "./firebase.js";
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

/* ================= TRANSLATE UI ================= */
translateCommonElements();

const kpiTitles = document.querySelectorAll(".kpi-title");
if (kpiTitles.length >= 4) {
  kpiTitles[0].innerText = t("Live Birds");
  kpiTitles[1].innerText = t("Mortality %");
  kpiTitles[2].innerText = t("Avg BW (g)");
  kpiTitles[3].innerText = t("FCR");
}

const cardTitles = document.querySelectorAll(".card h3");
if (cardTitles.length > 0) cardTitles[0].innerText = t("Body Weight Trend");
if (cardTitles.length > 1) cardTitles[1].innerText = t("FCR Trend");
if (cardTitles.length > 2) cardTitles[2].innerText = t("Mortality Trend");

const perfSummary = document.querySelector(".card p");
if (perfSummary) perfSummary.innerText = t("Performance Summary");

const dashTitle = document.querySelector(".card h2");
if (dashTitle) dashTitle.innerText = t("Poultry Dashboard");

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
    alert(t("No daily data available yet"));
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
  const liveBirdsVal = totalChicks - last.mortalityTotal - totalBirdsSold;
  const mortPctVal = last.mortalityPct + "%";
  const bwVal = last.bodyWtActual;
  const bwStdVal = last.bodyWtMin;
  const fcrVal = last.fcrActual;
  const fcrStdVal = last.fcrStd;

  // Helper for consistent card styling
  const itemStyle = "text-align:center; padding:15px 10px; background:rgba(251, 140, 0, 0.05); border-radius:12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s;";
  const labelStyle = "font-size:12px; color:#666; display:block; margin-bottom:6px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;";
  const valStyle = "font-weight:800; font-size:22px; color:#2e7d32; line-height:1.2;";
  const subStyle = "font-size:11px; color:#888; margin-top:4px;";

  const renderGridItems = (items) => items.map(item => `
      <div style="${itemStyle}" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          <label style="${labelStyle}">${item.label}</label>
          <div style="${valStyle} ${item.color ? 'color:'+item.color : 'color:#ef6c00'}">${item.value}</div>
          ${item.sub ? `<div style="${subStyle}">${item.sub}</div>` : ''}
      </div>
    `).join('');

  const renderStyledCard = (title, items) => {
    return `
      <h3 style="margin-bottom:20px; color:#ef6c00; border-bottom:2px solid #fff3e0; padding-bottom:10px; font-size:18px; font-weight:bold;">
          ${title}
      </h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:15px;">
          ${renderGridItems(items)}
      </div>
    `;
  };

  // Update Performance Summary Card
  const liveBirdsEl = document.getElementById("liveBirds");
  const perfCard = liveBirdsEl ? liveBirdsEl.closest(".card") : document.querySelector(".card");

  if (perfCard) {
    perfCard.innerHTML = renderStyledCard(t("Performance Summary"), [
      { label: t("Live Birds"), value: liveBirdsVal },
      { label: t("Mortality %"), value: mortPctVal, color: "#d32f2f" },
      { label: t("Avg BW (g)"), value: bwVal, sub: `${t("Std")}: ${bwStdVal}` },
      { label: t("FCR"), value: fcrVal, sub: `${t("Std")}: ${fcrStdVal}` }
    ]);
  }

  // Update Lifting Stats if elements exist
  const elBirdsSold = document.getElementById("birdsSold");
  if (elBirdsSold) elBirdsSold.innerText = totalBirdsSold;

  const elNetWt = document.getElementById("netWeightSold");
  if (elNetWt) elNetWt.innerText = totalNetWeightSold.toFixed(2);

  /* ================= SALES ANALYSIS (FCR/CFCR) ================= */
  if (totalBirdsSold > 0 && totalNetWeightSold > 0) {
    const totalFeedUsedKg = rows.reduce((sum, r) => sum + (r.feedUsed || 0), 0);
    const avgSalesBwKg = totalNetWeightSold / totalBirdsSold;
    const salesFCR = totalFeedUsedKg / totalNetWeightSold;
    const factor = Number(((2 - avgSalesBwKg) * 0.22).toFixed(2));
    const salesCFCR = Number((factor + salesFCR).toFixed(2));

    // Rate Calculation
    let rate = 0;
    if (salesCFCR > 0) {
        const rCFCR = Math.round(salesCFCR * 100) / 100;
        const rates = [
          {c:1.42,r:11.25},{c:1.43,r:11.05},{c:1.44,r:10.85},{c:1.45,r:10.65},{c:1.46,r:10.45},
          {c:1.47,r:10.25},{c:1.48,r:10.05},{c:1.49,r:9.85},{c:1.50,r:9.65},{c:1.51,r:9.45},
          {c:1.52,r:9.25},{c:1.53,r:9.05},{c:1.54,r:8.85},{c:1.55,r:8.65},{c:1.56,r:8.45},
          {c:1.57,r:8.25},{c:1.58,r:8.05},{c:1.59,r:7.85},{c:1.60,r:7.70},{c:1.61,r:7.55},
          {c:1.62,r:7.40},{c:1.63,r:7.25},{c:1.64,r:7.10},{c:1.65,r:6.95},{c:1.66,r:6.80},
          {c:1.67,r:6.65},{c:1.68,r:6.50},{c:1.69,r:6.35},{c:1.70,r:6.20},{c:1.71,r:6.05},
          {c:1.72,r:5.90},{c:1.73,r:5.75},{c:1.74,r:5.60},{c:1.75,r:5.45}
        ];
        const match = rates.find(x => Math.abs(x.c - rCFCR) < 0.001);
        if (match) rate = match.r;
        else if (rCFCR < 1.42) rate = 11.25;
        else if (rCFCR > 1.75) rate = 5.45;
    }
    const revenue = rate * totalNetWeightSold;

    if (perfCard && perfCard.parentNode) {
      let salesCard = document.getElementById("salesCard");
      if (!salesCard) {
        salesCard = document.createElement("div");
        salesCard.id = "salesCard";
        salesCard.className = "card";
        salesCard.style.marginTop = "20px";
        // Insert after the Performance Summary card
        perfCard.parentNode.insertBefore(salesCard, perfCard.nextSibling);
      }

      salesCard.innerHTML = `
        <h3 style="margin-bottom:20px; color:#ef6c00; border-bottom:2px solid #fff3e0; padding-bottom:10px; font-size:18px; font-weight:bold;">
            ${t("Sales Analysis")}
        </h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:15px;">
            ${renderGridItems([
              { label: t("Total Net Wt"), value: totalNetWeightSold.toFixed(0) },
              { label: t("Avg Sales Weight"), value: avgSalesBwKg.toFixed(3) },
              { label: t("Batch FCR"), value: salesFCR.toFixed(3) },
              { label: t("CFCR"), value: salesCFCR.toFixed(2), color: "#d32f2f" }
            ])}
        </div>
        <div style="margin: 20px 0; border-top: 1px dashed #ccc;"></div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:15px;">
            ${renderGridItems([
              { label: t("Rate"), value: rate.toFixed(2) },
              { label: t("Total Revenue"), value: revenue.toFixed(0), color: "#ef6c00" }
            ])}
        </div>
      `;
    }
  }

  const labels = rows.map(r => "Day " + r.age);

  
  /* ================= CHARTS ================= */
  
  // Helper for gradients
  const getGrad = (ctx, r, g, b) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.02)`);
    return gradient;
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: "'Inter', sans-serif", size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        titleFont: { family: "'Inter', sans-serif", size: 13 },
        bodyFont: { family: "'Inter', sans-serif", size: 13 }
      }
    },
    elements: {
      line: {
        tension: 0.4, // Smooth curves (Grafana style)
        borderWidth: 2
      },
      point: {
        radius: 0, // Hide points by default
        hitRadius: 20,
        hoverRadius: 6,
        hoverBorderWidth: 2
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { maxTicksLimit: 8, color: '#888', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)', borderDash: [4, 4], drawBorder: false },
        ticks: { color: '#888', font: { size: 11 } },
        border: { display: false }
      }
    }
  };

  // 1. Body Weight Chart
  const ctxBw = document.getElementById("bwChart").getContext("2d");
  new Chart(ctxBw, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("BW Actual"),
          data: rows.map(r => r.bodyWtActual),
          borderColor: '#2e7d32', // Green
          backgroundColor: getGrad(ctxBw, 46, 125, 50),
          fill: true,
          pointBackgroundColor: '#2e7d32'
        },
        {
          label: t("BW Std"),
          data: rows.map(r => r.bodyWtMin),
          borderColor: '#9e9e9e', // Grey
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: commonOptions
  });

  // 2. FCR Chart
  const ctxFcr = document.getElementById("fcrChart").getContext("2d");
  new Chart(ctxFcr, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("FCR Actual"),
          data: rows.map(r => r.fcrActual),
          borderColor: '#fb8c00', // Orange
          backgroundColor: getGrad(ctxFcr, 251, 140, 0),
          fill: true,
          pointBackgroundColor: '#fb8c00'
        },
        {
          label: t("FCR Std"),
          data: rows.map(r => r.fcrStd),
          borderColor: '#9e9e9e',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: commonOptions
  });

  // 3. Mortality Chart
  const ctxMort = document.getElementById("mortChart").getContext("2d");
  new Chart(ctxMort, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("Mortality %"),
          data: rows.map(r => r.mortalityPct),
          borderColor: '#d32f2f', // Red
          backgroundColor: getGrad(ctxMort, 211, 47, 47),
          fill: true,
          pointBackgroundColor: '#d32f2f'
        }
      ]
    },
    options: commonOptions
  });

  /* ================= AUTO ACTIONS (FROM OTHER PAGES) ================= */
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");
  
  if (action === "viewChart") {
    document.getElementById("viewChartBtn").click();
  } else if (action === "shareChart") {
    document.getElementById("shareChartBtn").click();
  }
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
  pdf.text(t("BROILER PERFORMANCE RECORD"), 14, 10);

  pdf.setFontSize(10);
  pdf.text(`${t("Farmer")} : ${farmerName}`, 14, 16);
  pdf.text(`${t("Hatchery")} : ${hatcheryName} (${hatcheryCode})`, 14, 22);
  pdf.text(`${t("Batch")} : ${batchCode}`, 14, 28);

  pdf.line(14, 30, 285, 30);

  const headers = [[
    t("Date"), t("Age"),
    "Mort D", "Mort T", t("Mortality %"),
    "Feed Rec", "Feed Used", "Feed Bal",
    "FI Std", "FI Act",
    "Cum Std", "Cum Act",
    t("BW Std"), t("BW Actual"),
    t("FCR Std"), t("FCR Actual")
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
      title: t("Daily Poultry Chart")
    });
  } else {
    window.open(pdf.output("bloburl"), "_blank");
  }
};
