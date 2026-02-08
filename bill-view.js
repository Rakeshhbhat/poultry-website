/* ================= IMPORTS ================= */
import "./firebase.js";

import { getAuth, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= FIREBASE ================= */
const auth = getAuth();
const db = getFirestore();

/* ================= HELPERS ================= */
const el = id => document.getElementById(id);

/* ================= GET BILL ID ================= */
const billId = new URLSearchParams(location.search).get("billId");

if (!billId) {
  alert("Invalid bill");
  history.back();
}

/* ================= LOAD BILL ================= */
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  try {
    const snap = await getDoc(
      doc(db, "farmers", user.uid, "bills", billId)
    );

    if (!snap.exists()) {
      alert("Bill not found");
      return;
    }

    const b = snap.data();

    /* ---- HEADER ---- */
    el("billNo").innerText = b.billNo || "";
    el("billDate").innerText = b.date || "";
    el("traderName").innerText = b.traderName || "";
    el("vehicleNo").innerText = b.vehicleNo || "";

    /* ---- TOTALS ---- */
    el("totalBirds").innerText = b.totalBirds || 0;
    el("grossTotal").innerText = b.grossWeight || 0;
    el("emptyTotal").innerText = b.emptyWeight || 0;
    el("netTotal").innerText = b.netWeight || 0;

    /* ---- WEIGHT TABLE (KG / GMS LIKE PAPER) ---- */
    const tbody = el("weightTable");
    tbody.innerHTML = "";

    const empty = b.emptyWeights || [];
    const gross = b.grossWeights || [];

    const rows = Math.max(empty.length, gross.length);

    for (let i = 0; i < rows; i++) {
      const e = empty[i] || 0;
      const g = gross[i] || 0;

      const ek = Math.floor(e);
      const eg = Math.round((e - ek) * 1000);

      const gk = Math.floor(g);
      const gg = Math.round((g - gk) * 1000);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${ek}</td>
        <td>${eg}</td>
        <td>${gk}</td>
        <td>${gg}</td>
      `;
      tbody.appendChild(tr);
    }

  } catch (err) {
    console.error(err);
    alert("Failed to load bill");
  }
});

/* ================= PDF GENERATION ================= */
async function generatePdfBlob() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const content = document.getElementById("pdfContent");

  const canvas = await html2canvas(content, {
    scale: 2,
    backgroundColor: "#ffffff"
  });

  const imgData = canvas.toDataURL("image/png");
  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  return pdf.output("blob");
}

/* ================= SHARE (WHATSAPP / SYSTEM) ================= */
el("sharePdf").onclick = async () => {
  try {
    const blob = await generatePdfBlob();
    const file = new File([blob], "Delivery-Challan.pdf", {
      type: "application/pdf"
    });

    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        title: "Delivery Challan",
        text: "Delivery Challan – Sujaya Feeds & Farms",
        files: [file]
      });
    } else {
      alert("Sharing not supported on this device");
    }
  } catch (err) {
    console.error(err);
    alert("Share cancelled");
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
