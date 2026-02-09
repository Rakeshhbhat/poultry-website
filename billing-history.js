import "./firebase.js";

import { getAuth, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* INIT */
const auth = getAuth();
const db = getFirestore();
const list = document.getElementById("billList");

/* ================= UI SETUP ================= */
// Inject Consolidated PDF Button
const container = document.querySelector(".card") || document.body;
const btnDiv = document.createElement("div");
btnDiv.style.marginBottom = "15px";
btnDiv.innerHTML = `
  <button id="consolidatedBtn" class="btn-primary" style="width:100%">
    Download Consolidated Bill PDF
  </button>
`;
if (list.parentElement) {
  list.parentElement.insertBefore(btnDiv, list.parentElement.querySelector("table"));
}

document.getElementById("consolidatedBtn").onclick = generateConsolidatedPdf;

/* AUTH */
onAuthStateChanged(auth, async user => {
  if (!user) return;

const batchId = localStorage.getItem("activeBatchId");

const q = query(
  collection(
    db,
    "farmers",
    user.uid,
    "batches",
    batchId,
    "bills"
  ),
  orderBy("createdAt", "desc")
);


  const snap = await getDocs(q);
  list.innerHTML = "";

  snap.forEach(d => {
    const b = d.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${b.billNo}</td>
      <td>${b.date}</td>
      <td>${b.traderName}</td>
      <td>
        <button onclick="openBill('${d.id}')" style="margin-right:5px;">View</button>
        <button onclick="editBill('${d.id}')" class="btn-secondary" style="padding:5px 10px;">Edit</button>
      </td>
    `;

    list.appendChild(tr);
  });
});

/* VIEW */
window.openBill = id => {
  location.href = `bill-view.html?billId=${id}`;
};

window.editBill = id => {
  location.href = `billing.html?billId=${id}`;
};

/* ================= CONSOLIDATED PDF ================= */
async function generateConsolidatedPdf() {
  const user = auth.currentUser;
  if (!user) return;

  const batchId = localStorage.getItem("activeBatchId");
  const q = query(
    collection(db, "farmers", user.uid, "batches", batchId, "bills"),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);
  if (snap.empty) {
    alert("No bills found to consolidate.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Consolidated Bill Report", 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

  const headers = [["Bill No", "Date", "Trader", "Birds", "Net Wt (Kg)", "Gross (Kg)"]];
  const body = [];
  let totalBirds = 0;
  let totalNet = 0;
  let totalGross = 0;

  snap.forEach(d => {
    const b = d.data();
    body.push([
      b.billNo,
      b.date,
      b.traderName,
      b.totalBirds,
      b.netWeight.toFixed(2),
      b.grossWeight.toFixed(2)
    ]);

    totalBirds += (b.totalBirds || 0);
    totalNet += (b.netWeight || 0);
    totalGross += (b.grossWeight || 0);
  });

  // Total Row
  body.push(["", "", "TOTAL", totalBirds, totalNet.toFixed(2), totalGross.toFixed(2)]);

  doc.autoTable({
    head: headers,
    body: body,
    startY: 25,
    theme: 'grid',
    headStyles: { fillColor: [103, 58, 183] },
    footStyles: { fillColor: [220, 220, 220], textColor: [0,0,0], fontStyle: 'bold' }
  });

  doc.save("Consolidated_Bills.pdf");
}
