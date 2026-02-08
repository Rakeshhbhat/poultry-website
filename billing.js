/* ================= HELPERS ================= */
const el = id => document.getElementById(id);

/* ================= INIT ================= */
el("billDate").valueAsDate = new Date();
el("billNo").value = "AUTO"; // replace later with bill-number logic

/* ================= WEIGHTS (SEPARATE EMPTY & GROSS) ================= */
const emptyBody = el("emptyBody");
const grossBody = el("grossBody");

const addEmptyBtn = el("addEmptyRow");
const addGrossBtn = el("addGrossRow");

function addEmptyRow(val = "") {
  const sl = emptyBody.children.length + 1;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${sl}</td>
    <td>
      <input type="number" step="0.001" placeholder="40.250"
             class="emptyWt" value="${val}">
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
      <input type="number" step="0.001" placeholder="141.450"
             class="grossWt" value="${val}">
    </td>
  `;
  grossBody.appendChild(tr);
  tr.querySelector("input").oninput = calculateTotals;
}

addEmptyBtn.onclick = () => addEmptyRow();
addGrossBtn.onclick = () => addGrossRow();

// start with 3 rows each
for (let i = 0; i < 3; i++) addEmptyRow();
for (let i = 0; i < 3; i++) addGrossRow();

/* ================= TOTAL CALCULATION ================= */
function calculateTotals() {
  let emptyGrams = 0;
  let grossGrams = 0;

  document.querySelectorAll(".emptyWt").forEach(i => {
    emptyGrams += Math.round(Number(i.value || 0) * 1000);
  });

  document.querySelectorAll(".grossWt").forEach(i => {
    grossGrams += Math.round(Number(i.value || 0) * 1000);
  });

  el("emptyTotal").innerText = (emptyGrams / 1000).toFixed(3);
  el("grossTotal").innerText = (grossGrams / 1000).toFixed(3);
  el("netTotal").innerText =
    ((grossGrams - emptyGrams) / 1000).toFixed(3);
}


/* ================= CRATE / BIRD LOGIC ================= */
const crateBody = el("crateBody");
const addCrateRowBtn = el("addCrateRow");

function addCrateRow() {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="number" class="crate"></td>
    <td><input type="number" class="birds"></td>
    <td class="rowTotal">0</td>
    <td><button class="btn-danger">✕</button></td>
  `;

  crateBody.appendChild(tr);

  const c = tr.querySelector(".crate");
  const b = tr.querySelector(".birds");
  const t = tr.querySelector(".rowTotal");

  function recalc() {
    t.innerText = (Number(c.value || 0) * Number(b.value || 0));
    calcBirds();
  }

  c.oninput = recalc;
  b.oninput = recalc;
  tr.querySelector("button").onclick = () => { tr.remove(); calcBirds(); };
}

addCrateRowBtn.onclick = addCrateRow;
addCrateRow();

/* ================= CALCULATIONS ================= */
function calcWeights() {
  let gross = 0, empty = 0;

  weightBody.querySelectorAll("tr").forEach(tr => {
    const ekg = Number(tr.querySelector(".ekg").value || 0);
    const eg  = Number(tr.querySelector(".eg").value || 0);
    const gkg = Number(tr.querySelector(".gkg").value || 0);
    const gg  = Number(tr.querySelector(".gg").value || 0);

    empty += ekg * 1000 + eg;
    gross += gkg * 1000 + gg;
  });

  el("grossTotal").innerText = (gross / 1000).toFixed(3);
  el("emptyTotal").innerText = (empty / 1000).toFixed(3);
  el("netTotal").innerText   = ((gross - empty) / 1000).toFixed(3);
}

function calcBirds() {
  let total = 0;
  crateBody.querySelectorAll(".rowTotal").forEach(td => {
    total += Number(td.innerText || 0);
  });
  el("totalBirds").innerText = total;
}

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

el("saveBill").onclick = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Not logged in");
    return;
  }

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
    collection(db, "farmers", user.uid, "bills"),
    billData
  );

  alert("Bill saved successfully");
};


el("shareBill").onclick = generateBillPDF;

function generateBillPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  /* ================= HEADER ================= */
  doc.setFontSize(14);
  doc.text("DELIVERY CHALLAN FOR BIRDS", 105, 12, { align: "center" });

  doc.setFontSize(11);
  doc.text("SUJAYA FEEDS & FARMS", 105, 18, { align: "center" });
  doc.setFontSize(9);
  doc.text("Padubelle, Post Bantakal, Udupi - 574115", 105, 23, { align: "center" });
  doc.text("GSTIN: 29AATFS4934N1Z5", 105, 27, { align: "center" });

  /* ================= BILL INFO ================= */
  let y = 34;
  doc.setFontSize(10);
  doc.text(`Bill No: ${el("billNo").value}`, 14, y);
  doc.text(`Date: ${el("billDate").value}`, 150, y);

  y += 6;
  doc.text(`Trader Name: ${el("traderName").value}`, 14, y);
  y += 6;
  doc.text(`Vehicle No: ${el("vehicleNo").value}`, 14, y);

  /* ================= WEIGHT TABLE ================= */
  y += 10;

  const emptyVals = [...document.querySelectorAll(".emptyWt")]
    .map(i => Number(i.value || 0));
  const grossVals = [...document.querySelectorAll(".grossWt")]
    .map(i => Number(i.value || 0));

  const maxRows = Math.max(emptyVals.length, grossVals.length);
  const weightRows = [];

  for (let i = 0; i < maxRows; i++) {
    const e = emptyVals[i] || "";
    const g = grossVals[i] || "";

    weightRows.push([
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
    body: weightRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [240, 240, 240] }
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ================= BIRD COUNT ================= */
  doc.text("No. of Birds:", 14, y);
  y += 5;

  let totalBirds = 0;
  document.querySelectorAll("#crateBody tr").forEach(tr => {
    const c = Number(tr.querySelector(".crate").value || 0);
    const b = Number(tr.querySelector(".birds").value || 0);
    if (c && b) {
      const t = c * b;
      totalBirds += t;
      doc.text(`${c} × ${b} = ${t}`, 20, y);
      y += 5;
    }
  });

  doc.text(`Total Birds: ${totalBirds}`, 20, y + 2);

  /* ================= TOTALS ================= */
  y += 10;
  doc.text(`Gross Weight: ${el("grossTotal").innerText} kg`, 14, y);
  y += 5;
  doc.text(`Empty Weight: ${el("emptyTotal").innerText} kg`, 14, y);
  y += 5;
  doc.setFont(undefined, "bold");
  doc.text(`Net Weight: ${el("netTotal").innerText} kg`, 14, y);
  doc.setFont(undefined, "normal");

  /* ================= SAVE / SHARE ================= */
  doc.save(`Bill_${el("billNo").value || "draft"}.pdf`);
}

