/* ================= HELPERS ================= */
const el = id => document.getElementById(id);

/* ================= FIREBASE ================= */
import { getAuth, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();
let currentUser = null;

/* ================= INIT ================= */
el("billDate").valueAsDate = new Date();
el("billNo").value = "AUTO"; // will replace later

/* ================= AUTH + VIEW MODE ================= */
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login");
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  // If billId present → load bill (VIEW MODE)
  const params = new URLSearchParams(window.location.search);
  const billId = params.get("billId");
  if (billId) loadBill(billId);
});

/* ================= WEIGHTS (EMPTY & GROSS SEPARATE) ================= */
const emptyBody = el("emptyBody");
const grossBody = el("grossBody");

el("addEmptyRow").onclick = () => addEmptyRow();
el("addGrossRow").onclick = () => addGrossRow();

function addEmptyRow(val = "") {
  const sl = emptyBody.children.length + 1;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${sl}</td>
    <td>
      <input type="number" step="0.001"
        class="emptyWt" placeholder="40.250" value="${val}">
    </td>
  `;
  emptyBody.appendChild(tr);
  tr.querySelector("input").oninput = calculateTotals;
}

function addGrossRow(val = "") {
  const sl = grossBody.children.length + 1;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${sl}</td>
    <td>
      <input type="number" step="0.001"
        class="grossWt" placeholder="141.450" value="${val}">
    </td>
  `;
  grossBody.appendChild(tr);
  tr.querySelector("input").oninput = calculateTotals;
}

// Default rows
for (let i = 0; i < 3; i++) addEmptyRow();
for (let i = 0; i < 3; i++) addGrossRow();

/* ================= CRATE / BIRD LOGIC ================= */
const crateBody = el("crateBody");
el("addCrateRow").onclick = () => addCrateRow();

function addCrateRow(c = "", b = "") {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="number" class="crate" value="${c}"></td>
    <td><input type="number" class="birds" value="${b}"></td>
    <td class="rowTotal">0</td>
    <td><button class="btn-danger">✕</button></td>
  `;
  crateBody.appendChild(tr);

  const crate = tr.querySelector(".crate");
  const birds = tr.querySelector(".birds");
  const total = tr.querySelector(".rowTotal");

  function recalc() {
    total.innerText =
      (Number(crate.value || 0) * Number(birds.value || 0));
    calcBirds();
  }

  crate.oninput = recalc;
  birds.oninput = recalc;

  tr.querySelector("button").onclick = () => {
    tr.remove();
    calcBirds();
  };
}

addCrateRow();

/* ================= TOTAL CALCULATIONS ================= */
function calculateTotals() {
  let empty = 0;
  let gross = 0;

  document.querySelectorAll(".emptyWt").forEach(i => {
    empty += Math.round(Number(i.value || 0) * 1000);
  });

  document.querySelectorAll(".grossWt").forEach(i => {
    gross += Math.round(Number(i.value || 0) * 1000);
  });

  el("emptyTotal").innerText = (empty / 1000).toFixed(3);
  el("grossTotal").innerText = (gross / 1000).toFixed(3);
  el("netTotal").innerText =
    ((gross - empty) / 1000).toFixed(3);
}

function calcBirds() {
  let total = 0;
  crateBody.querySelectorAll(".rowTotal").forEach(td => {
    total += Number(td.innerText || 0);
  });
  el("totalBirds").innerText = total;
}

/* ================= SAVE BILL ================= */
el("saveBill").onclick = async () => {
  if (!currentUser) return;

  const billData = {
    billNo: el("billNo").value,
    date: el("billDate").value,
    traderName: el("traderName").value,
    vehicleNo: el("vehicleNo").value,
    totalBirds: Number(el("totalBirds").innerText),
    grossWeight: Number(el("grossTotal").innerText),
    emptyWeight: Number(el("emptyTotal").innerText),
    netWeight: Number(el("netTotal").innerText),
    createdAt: serverTimestamp()
  };

  await addDoc(
    collection(db, "farmers", currentUser.uid, "bills"),
    billData
  );

  alert("Bill saved successfully");
};

/* ================= LOAD BILL (VIEW MODE) ================= */
async function loadBill(billId) {
  const ref = doc(db, "farmers", currentUser.uid, "bills", billId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const b = snap.data();

  el("billNo").value = b.billNo;
  el("billDate").value = b.date;
  el("traderName").value = b.traderName;
  el("vehicleNo").value = b.vehicleNo;

  el("totalBirds").innerText = b.totalBirds;
  el("grossTotal").innerText = b.grossWeight.toFixed(3);
  el("emptyTotal").innerText = b.emptyWeight.toFixed(3);
  el("netTotal").innerText = b.netWeight.toFixed(3);
}

/* ================= PDF ================= */
el("shareBill").onclick = generateBillPDF;

function generateBillPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFontSize(14);
  doc.text("DELIVERY CHALLAN FOR BIRDS", 105, 12, { align: "center" });

  doc.setFontSize(11);
  doc.text("SUJAYA FEEDS & FARMS", 105, 18, { align: "center" });
  doc.setFontSize(9);
  doc.text("Padubelle, Post Bantakal, Udupi - 574115", 105, 23, { align: "center" });
  doc.text("GSTIN: 29AATFS4934N1Z5", 105, 27, { align: "center" });

  let y = 34;
  doc.setFontSize(10);
  doc.text(`Bill No: ${el("billNo").value}`, 14, y);
  doc.text(`Date: ${el("billDate").value}`, 150, y);

  y += 6;
  doc.text(`Trader Name: ${el("traderName").value}`, 14, y);
  y += 6;
  doc.text(`Vehicle No: ${el("vehicleNo").value}`, 14, y);

  y += 8;

  const emptyVals = [...document.querySelectorAll(".emptyWt")]
    .map(i => Number(i.value || 0));
  const grossVals = [...document.querySelectorAll(".grossWt")]
    .map(i => Number(i.value || 0));

  const rows = [];
  const max = Math.max(emptyVals.length, grossVals.length);

  for (let i = 0; i < max; i++) {
    const e = emptyVals[i];
    const g = grossVals[i];
    rows.push([
      i + 1,
      e ? Math.floor(e) : "",
      e ? Math.round((e % 1) * 1000) : "",
      g ? Math.floor(g) : "",
      g ? Math.round((g % 1) * 1000) : ""
    ]);
  }

  doc.autoTable({
    startY: y,
    head: [["Sl", "Empty Kg", "Empty g", "Gross Kg", "Gross g"]],
    body: rows,
    styles: { fontSize: 9 }
  });

  y = doc.lastAutoTable.finalY + 6;

  doc.text(`Total Birds: ${el("totalBirds").innerText}`, 14, y);
  y += 5;
  doc.text(`Gross Weight: ${el("grossTotal").innerText} kg`, 14, y);
  y += 5;
  doc.text(`Empty Weight: ${el("emptyTotal").innerText} kg`, 14, y);
  y += 5;
  doc.setFont(undefined, "bold");
  doc.text(`Net Weight: ${el("netTotal").innerText} kg`, 14, y);

  doc.save(`Bill_${el("billNo").value || "draft"}.pdf`);
}
