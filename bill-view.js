/* ================= IMPORTS ================= */
import "./firebase.js";

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

/* ================= GET BILL ID ================= */
const billId = new URLSearchParams(location.search).get("billId");

if (!billId) {
  alert("Invalid bill");
  history.back();
}

/* ================= LOAD DATA ================= */
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  const snap = await getDoc(
    doc(db, "farmers", user.uid, "bills", billId)
  );

  if (!snap.exists()) {
    alert("Bill not found");
    return;
  }

  const b = snap.data();

  /* ---------- HEADER ---------- */
  el("billNo").innerText = b.billNo || "";
  el("billDate").innerText = b.date || "";
  el("traderName").innerText = b.traderName || "";
  el("vehicleNo").innerText = b.vehicleNo || "";

  /* ---------- SUMMARY ---------- */
  el("totalBirds").innerText = b.totalBirds || 0;
  el("grossTotal").innerText = (b.grossWeight || 0).toFixed(2);
  el("emptyTotal").innerText = (b.emptyWeight || 0).toFixed(2);
  el("netTotal").innerText = (b.netWeight || 0).toFixed(2);

  ;

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
});

/* ================= BIRD BREAKDOWN ================= */
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

  el("birdGrandTotal").innerText = birdTotal

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
    backgroundColor: "#ffffff"
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
    alert("Sharing not supported");
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
