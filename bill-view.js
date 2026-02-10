/* ================= IMPORTS ================= */
import { t } from "./firebase.js";

import { getAuth, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= INIT ================= */
const auth = getAuth();
const db = getFirestore();
const el = id => document.getElementById(id);

/* ================= INJECT BACK BUTTON ================= */
const sticky = document.querySelector(".sticky-actions");
// Check if ANY back button exists (by ID or onclick handler) to prevent duplicates
const hasBackBtn = document.getElementById("backBtn") || document.querySelector("button[onclick*='history.back']");

if (sticky && !hasBackBtn) {
  const backBtn = document.createElement("button");
  backBtn.id = "backBtn";
  backBtn.className = "btn-secondary";
  backBtn.innerText = t("Back");
  backBtn.onclick = () => history.back();
  sticky.insertBefore(backBtn, sticky.firstChild);
}

/* ================= GET BILL ID ================= */
const billId = new URLSearchParams(location.search).get("billId");

if (!billId) {
  alert(t("Invalid bill"));
  history.back();
}

/* ================= LOAD DATA ================= */
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  const batchId = localStorage.getItem("activeBatchId");

  const snap = await getDoc(
    doc(
      db,
      "farmers",
      user.uid,
      "batches",
      batchId,
      "bills",
      billId
    )
  );

  if (!snap.exists()) {
    alert(t("Bill not found"));
    return;
  }

  const b = snap.data();

  /* ---------- HEADER RECONSTRUCTION ---------- */
  // Rebuild the header card to include Farmer Name and better spacing
  const headerCard = el("billNo").closest(".card");
  if (headerCard) {
    headerCard.innerHTML = `
      <h2 style="text-align:center; margin-bottom:20px; color:#1b5e20;">${t("Delivery Challan")}</h2>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 10px;">
        <div>
          <label style="font-size:12px; color:#666; display:block;">${t("Bill No")}</label>
          <div style="font-weight:bold; font-size:16px;">${b.billNo || "-"}</div>
        </div>
        <div style="text-align:right;">
          <label style="font-size:12px; color:#666; display:block;">${t("Date")}</label>
          <div style="font-weight:bold; font-size:16px;">${b.date || "-"}</div>
        </div>
        <div>
          <label style="font-size:12px; color:#666; display:block;">${t("Farmer Name")}</label>
          <div style="font-weight:bold; font-size:16px;">${b.farmerName || "-"}</div>
        </div>
        <div style="text-align:right;">
          <label style="font-size:12px; color:#666; display:block;">${t("Trader Name")}</label>
          <div style="font-weight:bold; font-size:16px;">${b.traderName || "-"}</div>
        </div>
        <div>
          <label style="font-size:12px; color:#666; display:block;">${t("Vehicle No")}</label>
          <div style="font-weight:bold; font-size:16px;">${b.vehicleNo || "-"}</div>
        </div>
      </div>
    `;
  }

  /* ---------- SUMMARY ---------- */
  el("totalBirds").innerText = b.totalBirds || 0;
  el("grossTotal").innerText = (b.grossWeight || 0).toFixed(2);
  el("emptyTotal").innerText = (b.emptyWeight || 0).toFixed(2);
  el("netTotal").innerText = (b.netWeight || 0).toFixed(2);

  // Translate Summary Labels
  const summaryCard = el("totalBirds").closest(".card");
  if(summaryCard) {
     // Labels are hardcoded in HTML, but we can infer or leave as numbers are universal
     // Ideally, we would replace the text nodes "Gross:", "Empty:", "Net:" etc.
  }

  /* ================= WEIGHT TABLE ================= */
  const tbody = el("weightTable");
  tbody.innerHTML = "";

  const empty = b.emptyWeights || [];
  const gross = b.grossWeights || [];
  const rows = Math.max(empty.length, gross.length);

  for (let i = 0; i < rows; i++) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${(empty[i] || 0).toFixed(2)}</td>
      <td>${(gross[i] || 0).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  }

  /* ================= BIRD BREAKDOWN (FIXED) ================= */
  const birdBody = el("birdTable");
  birdBody.innerHTML = "";

  let birdTotal = 0;

  (b.crates || []).forEach(c => {
    if (!c.crate || !c.birds) return;

    const t = c.crate * c.birds;
    birdTotal += t;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.crate}</td>
      <td>${c.birds}</td>
      <td>${t}</td>
    `;
    birdBody.appendChild(tr);
  });

  el("birdGrandTotal").innerText = birdTotal;

  /* ---------- SIGNATURES ---------- */
  // Ensure signatures are visible at the bottom
  const content = document.getElementById("pdfContent");
  
  // Remove existing signature div if any (to avoid duplicates on reload)
  const existingSig = document.getElementById("signatureSection");
  if (existingSig) existingSig.remove();

  // Remove static HTML signature if it exists (to prevent duplicates)
  const staticSig = document.querySelector(".sign-row");
  if (staticSig) staticSig.remove();

  const sigDiv = document.createElement("div");
  sigDiv.id = "signatureSection";
  sigDiv.style.marginTop = "60px";
  sigDiv.style.marginBottom = "40px";
  sigDiv.style.display = "flex";
  sigDiv.style.justifyContent = "space-between";
  sigDiv.style.padding = "0 20px";
  
  sigDiv.innerHTML = `
    <div style="text-align:center;">
      <div style="height:40px;"></div>
      <div style="border-top:1px solid #333; padding-top:5px; font-weight:bold;">${t("Trader Sign")}</div>
    </div>
    <div style="text-align:center;">
      <div style="height:40px;"></div>
      <div style="border-top:1px solid #333; padding-top:5px; font-weight:bold;">${t("Supervisor Sign")}</div>
    </div>
  `;
  
  content.appendChild(sigDiv);
});

/* ================= PDF GENERATION ================= */
async function generatePdfBlob() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const content = document.getElementById("pdfContent");
  const sticky = document.querySelector(".sticky-actions");
  sticky.style.display = "none";

  const canvas = await html2canvas(content, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: 1200
  });

  sticky.style.display = "";

  const imgData = canvas.toDataURL("image/png");

  const pageWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf.output("blob");
}

/* ================= SHARE ================= */
el("sharePdf").onclick = async () => {
  const blob = await generatePdfBlob();
  const file = new File([blob], "Delivery-Challan.pdf", {
    type: "application/pdf"
  });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: "Delivery Challan",
      files: [file]
    });
  } else {
    alert(t("Sharing not supported"));
  }
};

/* ================= DOWNLOAD ================= */
el("downloadPdf").onclick = async () => {
  const blob = await generatePdfBlob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Delivery-Challan.pdf";
  a.click();

  URL.revokeObjectURL(url);
};
