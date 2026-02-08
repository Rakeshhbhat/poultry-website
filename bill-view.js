import "./firebase.js";
import { getAuth } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

const billId = new URLSearchParams(location.search).get("billId");

auth.onAuthStateChanged(async user => {
  if (!user || !billId) return;

  const snap = await getDoc(
   doc(db, "farmers", user.uid, "bills", billId)
  );

  if (!snap.exists()) return;

  const b = snap.data();

  document.getElementById("billNo").innerText = b.billNo;
  document.getElementById("billDate").innerText = b.date;
  document.getElementById("traderName").innerText = b.traderName;
  document.getElementById("vehicleNo").innerText = b.vehicleNo;
  document.getElementById("totalBirds").innerText = b.totalBirds;
  document.getElementById("grossTotal").innerText = b.grossWeight;
  document.getElementById("emptyTotal").innerText = b.emptyWeight;
  document.getElementById("netTotal").innerText = b.netWeight;

  const tbody = document.getElementById("weightTable");
  const rows = Math.max(
    b.emptyWeights.length,
    b.grossWeights.length
  );

  for (let i = 0; i < rows; i++) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${b.emptyWeights[i] ?? ""}</td>
      <td>${b.grossWeights[i] ?? ""}</td>
    `;
    tbody.appendChild(tr);
  }
});

/* PDF */
async function generatePdfBlob() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const content = document.getElementById("pdfContent");
  const canvas = await html2canvas(content, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  pdf.addImage(img, "PNG", 10, 10, 190, 0);

  return pdf.output("blob");
}

/* SHARE */
document.getElementById("sharePdf").onclick = async () => {
  const blob = await generatePdfBlob();

  if (navigator.share) {
    const file = new File([blob], "Delivery-Challan.pdf", {
      type: "application/pdf"
    });

    await navigator.share({
      files: [file],
      title: "Delivery Challan"
    });
  } else {
    alert("Sharing not supported on this device");
  }
};

/* DOWNLOAD */
document.getElementById("downloadPdf").onclick = async () => {
  const blob = await generatePdfBlob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Delivery-Challan.pdf";
  a.click();

  URL.revokeObjectURL(url);
};

