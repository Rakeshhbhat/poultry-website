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
async function generatePdfFile() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const content = document.getElementById("pdfContent");
  const canvas = await html2canvas(content, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  pdf.addImage(img, "PNG", 10, 10, 190, 0);

  const blob = pdf.output("blob");
  return new File([blob], "Delivery-Challan.pdf", {
    type: "application/pdf"
  });
}

/* SHARE */
document.getElementById("sharePdf").onclick = async () => {
  try {
    if (!navigator.canShare) {
      alert("Sharing not supported on this browser");
      return;
    }

    const file = await generatePdfFile();

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Delivery Challan",
        text: "Delivery Challan PDF",
        files: [file]
      });
    } else {
      alert("File sharing not supported");
    }
  } catch (err) {
    console.error(err);
    alert("Share cancelled");
  }
};

/* DOWNLOAD */
document.getElementById("downloadPdf").onclick = async () => {
  const file = await generatePdfFile();
  const url = URL.createObjectURL(file);

  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();

  URL.revokeObjectURL(url);
};


