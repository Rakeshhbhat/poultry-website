import { t, translateCommonElements } from "./firebase.js";

import { getAuth, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
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
btnDiv.style.marginTop = "20px";
btnDiv.innerHTML = `
  <button id="consolidatedBtn" class="btn-primary" style="width:100%">
    ${t("Consolidated Bill PDF")}
  </button>
`;

const table = list.closest("table");
if (table) {
  table.insertAdjacentElement("afterend", btnDiv);
}

document.getElementById("consolidatedBtn").onclick = generateConsolidatedPdf;

/* ================= TRANSLATE UI ================= */
translateCommonElements();
const ths = document.querySelectorAll("th");
if (ths.length >= 3) {
  ths[0].innerText = t("Bill No");
  ths[1].innerText = t("Date");
  ths[2].innerText = t("Trader");
}

if(document.querySelector("h2")) document.querySelector("h2").innerText = t("Bill Book");

/* ================= INJECT SIDEBAR ACTIONS ================= */
const sidebar = document.querySelector(".sidebar");
if (sidebar && !document.getElementById("viewChartBtn")) {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="sidebar-divider"></div>
    <button id="dashboardBtn" class="nav-item"><i>🏠</i> ${t("Dashboard")}</button>
    <button id="viewChartBtn" class="nav-item"><i>📈</i> ${t("View Chart")}</button>
    <button id="shareChartBtn" class="nav-item"><i>📤</i> ${t("Share Chart")}</button>
  `;
  
  // Insert before Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    sidebar.insertBefore(div, logoutBtn);
  } else {
    sidebar.appendChild(div);
  }

  document.getElementById("dashboardBtn").onclick = () => location.href = "dashboard.html";
  document.getElementById("viewChartBtn").onclick = () => location.href = "dashboard.html?action=viewChart";
  document.getElementById("shareChartBtn").onclick = () => location.href = "dashboard.html?action=shareChart";
}

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
        <button onclick="openBill('${d.id}')" style="margin-right:5px;">${t("View")}</button>
        <button onclick="editBill('${d.id}')" class="btn-secondary" style="padding:5px 10px;">${t("Edit")}</button>
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
    alert(t("No bills found to consolidate."));
    return;
  }

  // Fetch Daily Records for Feed Data
  const dailyQ = query(collection(db, "farmers", user.uid, "batches", batchId, "dailyRecords"));
  const dailySnap = await getDocs(dailyQ);
  
  let totalFeedUsedKg = 0;
  let feedBalanceKg = 0;
  let maxAge = -1;

  dailySnap.forEach(d => {
    const data = d.data();
    totalFeedUsedKg += (data.feedUsed || 0);
    if (data.age > maxAge) {
      maxAge = data.age;
      feedBalanceKg = (data.feedBalance || 0);
    }
  });

  // Fetch Header Info (Farmer & Batch)
  const farmerSnap = await getDoc(doc(db, "farmers", user.uid));
  const batchSnap = await getDoc(doc(db, "farmers", user.uid, "batches", batchId));
  
  const farmerName = farmerSnap.exists() ? (farmerSnap.data().farmerName || "") : "";
  const batchCode = batchSnap.exists() ? (batchSnap.data().batchCode || "") : "";

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const headers = [[t("Bill No"), t("Date"), t("Trader"), t("Total Birds"), t("Gross Weight"), t("Empty Weight"), t("Net Weight"), t("Avg BW (g)")]];
  const body = [];
  
  let totalBirds = 0;
  let totalGross = 0;
  let totalEmpty = 0;
  let totalNet = 0;

  snap.forEach(d => {
    const b = d.data();
    const birds = b.totalBirds || 0;
    const gross = b.grossWeight || 0;
    const empty = b.emptyWeight || 0;
    const net = b.netWeight || 0;
    const avg = birds > 0 ? (net / birds).toFixed(3) : "0.000";

    body.push([
      b.billNo,
      b.date,
      b.traderName,
      birds,
      gross.toFixed(2),
      empty.toFixed(2),
      net.toFixed(2),
      avg
    ]);

    totalBirds += birds;
    totalGross += gross;
    totalEmpty += empty;
    totalNet += net;
  });

  const totalAvg = totalBirds > 0 ? (totalNet / totalBirds).toFixed(3) : "0.000";

  // Total Row
  body.push(["", "", t("TOTAL"), totalBirds, totalGross.toFixed(2), totalEmpty.toFixed(2), totalNet.toFixed(2), totalAvg]);

  /* ================= PDF HEADER ================= */
  pdf.setFontSize(18);
  pdf.setTextColor(27, 94, 32); // Dark Green
  pdf.text(t("Consolidated Bill Report"), 14, 15);

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  // Left Column
  pdf.text(`${t("Farmer")}: ${farmerName}`, 14, 25);
  pdf.text(`${t("Batch")}: ${batchCode}`, 14, 30);
  pdf.text(`${t("Generated")}: ${new Date().toLocaleDateString()}`, 14, 35);

  // Right Column / Stats
  const feedUsedBags = (totalFeedUsedKg / 50).toFixed(1);
  const feedBalBags = (feedBalanceKg / 50).toFixed(1);

  pdf.text(`${t("Total Feed Used")}: ${feedUsedBags} ${t("bags")}`, 120, 25);
  pdf.text(`${t("Feed Remaining")}: ${feedBalBags} ${t("bags")}`, 120, 30);
  pdf.text(`${t("Avg Sales Weight")}: ${totalAvg} ${t("kg")}`, 120, 35);

  pdf.autoTable({
    head: headers,
    body: body,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [252, 128, 25] },
    footStyles: { fillColor: [220, 220, 220], textColor: [0,0,0], fontStyle: 'bold' }
  });

  pdf.save(`Consolidated_Report_${batchCode}.pdf`);
}
