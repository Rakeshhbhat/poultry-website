/* ================= IMPORTS ================= */
import { t, translateCommonElements } from "./firebase.js";

import { getAuth, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= RUN AFTER HTML READY ================= */
document.addEventListener("DOMContentLoaded", () => {

  const el = id => document.getElementById(id);

  const auth = getAuth();
  const db = getFirestore();

  let currentUser = null;
  let billId = null;

  // Unsaved changes flag
  let isDirty = false;
  window.onbeforeunload = () => isDirty ? t("Unsaved changes") : undefined;
  
  // Mark dirty on input
  document.body.addEventListener("input", (e) => {
    if (e.target.tagName === "INPUT") isDirty = true;
  });

  el("billDate").valueAsDate = new Date();

  /* ================= TRANSLATE UI ================= */
  translateCommonElements();

  // Translate Labels
  const labels = {
    "billNo": "Bill No",
    "billDate": "Date",
    "farmerNameBill": "Farmer Name",
    "traderName": "Trader Name",
    "vehicleNo": "Vehicle No"
  };
  for (const [id, key] of Object.entries(labels)) {
    const el = document.getElementById(id);
    if (el && el.previousElementSibling) el.previousElementSibling.innerText = t(key);
  }

  // Headers & Buttons
  if(document.querySelector("h2")) document.querySelector("h2").innerText = t("DELIVERY CHALLAN FOR BIRDS");
  
  const h3s = document.querySelectorAll("h3");
  if(h3s[0]) h3s[0].innerText = t("Empty Weights");
  if(h3s[1]) h3s[1].innerText = t("Gross Weights");
  if(h3s[2]) h3s[2].innerText = t("No. of Birds");

  el("addEmptyRow").innerText = t("Add Empty");
  el("addGrossRow").innerText = t("Add Gross");
  el("addCrateRow").innerText = t("Add Row");
  el("saveBill").innerText = t("Save Bill");

  // Table Headers
  const ths = document.querySelectorAll("th");
  ths.forEach(th => th.innerText = t(th.innerText) || th.innerText);

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
    
    // Insert before Logout button to keep layout consistent
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

  /* ================= AUTH ================= */
  onAuthStateChanged(auth, async user => {
    if (!user) {
      location.href = "index.html";
      return;
    }

    currentUser = user;
    billId = new URLSearchParams(location.search).get("billId");

    if (billId) {
      await loadBill(billId);
      el("saveBill").innerText = t("Update Bill");
    } else {
      el("billNo").value = await generateBillNo();
      
      const fSnap = await getDoc(doc(db, "farmers", currentUser.uid));
      if (fSnap.exists()) {
        el("farmerNameBill").value = fSnap.data().farmerName || fSnap.data().name || "";
      }
    }
  });

  /* ================= AUTO BILL NO ================= */
  async function generateBillNo() {
    // 1. Get or Create Farmer Prefix (3 digits)
    const farmerRef = doc(db, "farmers", currentUser.uid);
    const farmerSnap = await getDoc(farmerRef);
    let prefix = farmerSnap.data().billPrefix;

    if (!prefix) {
      // Generate random 3-digit prefix (001-999)
      const rand = Math.floor(Math.random() * 999) + 1;
      prefix = String(rand).padStart(3, "0");
      await setDoc(farmerRef, { billPrefix: prefix }, { merge: true });
    }

    // 2. Get Global Sequence
    const seq = farmerSnap.data().billSeq || 0;
    const nextSeq = seq + 1;

    // Format: Prefix (3) + Sequence (2) -> e.g., 00101
    return prefix + String(nextSeq).padStart(2, "0");
  }

  /* ================= WEIGHTS ================= */
  const emptyBody = el("emptyBody");
  const grossBody = el("grossBody");

  el("addEmptyRow").onclick = () => addEmptyRow();
  el("addGrossRow").onclick = () => addGrossRow();

  function addEmptyRow(v = "") {
    const idx = emptyBody.children.length + 1;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx}</td>
      <td><input class="emptyWt" type="number" step="0.001" value="${v}"></td>
    `;
    tr.querySelector("input").oninput = calculateTotals;
    emptyBody.appendChild(tr);
    calculateTotals();
  }

  function addGrossRow(v = "") {
    const idx = grossBody.children.length + 1;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx}</td>
      <td><input class="grossWt" type="number" step="0.001" value="${v}"></td>
    `;
    tr.querySelector("input").oninput = calculateTotals;
    grossBody.appendChild(tr);
    calculateTotals();
  }

for (let i = 0; i < 5; i++) addEmptyRow();
for (let i = 0; i < 5; i++) addGrossRow();


  /* ================= BIRDS ================= */
  const crateBody = el("crateBody");
  el("addCrateRow").onclick = () => addCrateRow();

  function addCrateRow(c = "", b = "") {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="crate" type="number" value="${c}"></td>
      <td><input class="birds" type="number" value="${b}"></td>
      <td class="rowTotal">0</td>
    `;
    tr.querySelectorAll("input").forEach(i => i.oninput = calcBirds);
    crateBody.appendChild(tr);
  }

  for (let i = 0; i < 2; i++) addCrateRow();

  /* ================= CALCULATIONS ================= */
  function calculateTotals() {
    let e = 0, g = 0;
    document.querySelectorAll(".emptyWt").forEach(i => e += +i.value || 0);
    document.querySelectorAll(".grossWt").forEach(i => g += +i.value || 0);
    el("emptyTotal").innerText = e.toFixed(3);
    el("grossTotal").innerText = g.toFixed(3);
    el("netTotal").innerText = (g - e).toFixed(3);
  }

  function calcBirds() {
    let total = 0;
    crateBody.querySelectorAll("tr").forEach(r => {
      const c = +r.querySelector(".crate").value || 0;
      const b = +r.querySelector(".birds").value || 0;
      const t = c * b;
      r.querySelector(".rowTotal").innerText = t;
      total += t;
    });
    el("totalBirds").innerText = total;
  }

  /* ================= SAVE ================= */
  el("saveBill").onclick = async () => {
    isDirty = false; // Reset flag before save
    try {
      if (!el("billNo").value) {
        el("billNo").value = await generateBillNo();
      }

  const batchId = localStorage.getItem("activeBatchId");

      let ref;
      if (billId) {
        // Update existing
        ref = doc(db, "farmers", currentUser.uid, "batches", batchId, "bills", billId);
      } else {
        // Create new
        ref = doc(collection(
          db, "farmers", currentUser.uid, "batches", batchId, "bills"
        ));
      }



      await setDoc(ref, {
        billNo: el("billNo").value,
        date: el("billDate").value,
        farmerName: el("farmerNameBill").value,
        traderName: el("traderName").value,
        vehicleNo: el("vehicleNo").value,

        emptyWeights: [...document.querySelectorAll(".emptyWt")].map(i => +i.value || 0),
        grossWeights: [...document.querySelectorAll(".grossWt")].map(i => +i.value || 0),
        crates: [...crateBody.querySelectorAll("tr")].map(r => ({
          crate: +r.querySelector(".crate").value || 0,
          birds: +r.querySelector(".birds").value || 0
        })),

        totalBirds: +el("totalBirds").innerText,
        grossWeight: +el("grossTotal").innerText,
        emptyWeight: +el("emptyTotal").innerText,
        netWeight: +el("netTotal").innerText,
        createdAt: serverTimestamp()
      });

      // Increment global sequence if new bill
      if (!billId) {
        const farmerRef = doc(db, "farmers", currentUser.uid);
        await updateDoc(farmerRef, {
          billSeq: increment(1)
        });
      }

      alert(t("Bill saved successfully"));
      location.href = "billing-history.html";

    } catch (e) {
      console.error(e);
      alert(t("Save failed – check console"));
    }
  };

  /* ================= LOAD ================= */
  async function loadBill(id) {
    const batchId = localStorage.getItem("activeBatchId");

    const ref = doc(
      db,
      "farmers",
      currentUser.uid,
      "batches",
      batchId,
      "bills",
      id
    );

    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const b = snap.data();

    el("billNo").value = b.billNo || "";
    el("billDate").value = b.date || "";
    el("farmerNameBill").value = b.farmerName || "";
    el("traderName").value = b.traderName || "";
    el("vehicleNo").value = b.vehicleNo || "";

    emptyBody.innerHTML = "";
    grossBody.innerHTML = "";
    crateBody.innerHTML = "";

    (b.emptyWeights || []).forEach(addEmptyRow);
    (b.grossWeights || []).forEach(addGrossRow);
    (b.crates || []).forEach(c => addCrateRow(c.crate, c.birds));

    calculateTotals();
    calcBirds();
  }

});
