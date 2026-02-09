/* ================= IMPORTS ================= */
import "./firebase.js";

import { getAuth, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= RUN AFTER HTML READY ================= */
document.addEventListener("DOMContentLoaded", () => {

  const el = id => document.getElementById(id);

  const auth = getAuth();
  const db = getFirestore();

  let currentUser = null;
  let billId = null;

  el("billDate").valueAsDate = new Date();

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
      el("saveBill").innerText = "Update Bill";
    } else {
      el("billNo").value = await generateBillNo();
    }
  });

  /* ================= AUTO BILL NO ================= */
  async function generateBillNo() {
    // 1. Get or Create Farmer Prefix (3 digits)
    const farmerRef = doc(db, "farmers", currentUser.uid);
    const farmerSnap = await getDoc(farmerRef);
    let prefix = farmerSnap.data().billPrefix;

    if (!prefix) {
      // Generate random 3-digit prefix if not exists
      prefix = String(Math.floor(Math.random() * 900) + 100);
      await setDoc(farmerRef, { billPrefix: prefix }, { merge: true });
    }

    // 2. Find max sequence in current batch
    const batchId = localStorage.getItem("activeBatchId");

const snap = await getDocs(
  collection(
    db,
    "farmers",
    currentUser.uid,
    "batches",
    batchId,
    "bills"
  )
);


    let max = 0;
    snap.forEach(d => {
      const bNo = String(d.data().billNo || "");
      if (bNo.startsWith(prefix)) {
        const seq = parseInt(bNo.substring(prefix.length));
        if (!isNaN(seq)) max = Math.max(max, seq);
      }
    });

    // Format: Prefix (3) + Sequence (2) -> e.g., 12301
    return prefix + String(max + 1).padStart(2, "0");
  }

  /* ================= WEIGHTS ================= */
  const emptyBody = el("emptyBody");
  const grossBody = el("grossBody");

  el("addEmptyRow").onclick = () => addEmptyRow();
  el("addGrossRow").onclick = () => addGrossRow();

  function addEmptyRow(v = "") {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input class="emptyWt" type="number" step="0.001" value="${v}"></td>`;
    tr.querySelector("input").oninput = calculateTotals;
    emptyBody.appendChild(tr);
    calculateTotals();
  }

  function addGrossRow(v = "") {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input class="grossWt" type="number" step="0.001" value="${v}"></td>`;
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

      alert("Bill saved successfully");
      location.href = "billing-history.html";

    } catch (e) {
      console.error(e);
      alert("Save failed – check console");
    }
  };

  /* ================= LOAD ================= */
  async function loadBill(id) {
const batchId = localStorage.getItem("activeBatchId");

const ref = doc(
  collection(
    db,
    "farmers",
    currentUser.uid,
    "batches",
    batchId,
    "bills"
  )
);

    if (!snap.exists()) return;

    const b = snap.data();

    el("billNo").value = b.billNo || "";
    el("billDate").value = b.date || "";
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
