/* HELPERS */
const el = id => document.getElementById(id);

/* FIREBASE */
import { getAuth, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();
let currentUser = null;
let billId = null;
let viewMode = false;

/* INIT */
el("billDate").valueAsDate = new Date();
el("billNo").value = "AUTO";

/* AUTH */
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  currentUser = user;

  billId = new URLSearchParams(location.search).get("billId");
  if (billId) {
    viewMode = true;
    loadBill(billId);
    el("saveBill").style.display = "none";
  }
});

/* WEIGHTS */
const emptyBody = el("emptyBody");
const grossBody = el("grossBody");

el("addEmptyRow").onclick = () => addEmptyRow();
el("addGrossRow").onclick = () => addGrossRow();

function addEmptyRow(val = "") {
  emptyBody.insertAdjacentHTML("beforeend",
    `<tr><td><input class="emptyWt" type="number" step="0.001" value="${val}"></td></tr>`
  );
  calculateTotals();
}

function addGrossRow(val = "") {
  grossBody.insertAdjacentHTML("beforeend",
    `<tr><td><input class="grossWt" type="number" step="0.001" value="${val}"></td></tr>`
  );
  calculateTotals();
}

addEmptyRow(); addEmptyRow(); addEmptyRow();
addGrossRow(); addGrossRow(); addGrossRow();

/* BIRDS */
const crateBody = el("crateBody");
el("addCrateRow").onclick = () => addCrateRow();

function addCrateRow(c = "", b = "") {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="crate" value="${c}"></td>
    <td><input class="birds" value="${b}"></td>
    <td class="rowTotal">0</td>
  `;
  crateBody.appendChild(tr);
  tr.querySelectorAll("input").forEach(i => i.oninput = calcBirds);
}

addCrateRow();

/* CALCULATIONS */
function calculateTotals() {
  let e = 0, g = 0;
  document.querySelectorAll(".emptyWt").forEach(i => e += (+i.value || 0));
  document.querySelectorAll(".grossWt").forEach(i => g += (+i.value || 0));

  el("emptyTotal").innerText = e.toFixed(3);
  el("grossTotal").innerText = g.toFixed(3);
  el("netTotal").innerText = (g - e).toFixed(3);
}

function calcBirds() {
  let t = 0;
  crateBody.querySelectorAll("tr").forEach(r => {
    const c = +r.querySelector(".crate").value || 0;
    const b = +r.querySelector(".birds").value || 0;
    r.querySelector(".rowTotal").innerText = c * b;
    t += c * b;
  });
  el("totalBirds").innerText = t;
}

/* DATA COLLECTORS */
const getEmptyWeights = () =>
  [...document.querySelectorAll(".emptyWt")].map(i => +i.value || 0);

const getGrossWeights = () =>
  [...document.querySelectorAll(".grossWt")].map(i => +i.value || 0);

const getCrates = () =>
  [...crateBody.querySelectorAll("tr")].map(r => ({
    crate: +r.querySelector(".crate").value || 0,
    birds: +r.querySelector(".birds").value || 0
  }));

/* SAVE BILL */
el("saveBill").onclick = async () => {

  const ref = doc(
    collection(db, "farmers", currentUser.uid, "bills")
  );

  await setDoc(ref, {
    billNo: el("billNo").value,
    date: el("billDate").value,
    traderName: el("traderName").value,
    vehicleNo: el("vehicleNo").value,

    emptyWeights: getEmptyWeights(),
    grossWeights: getGrossWeights(),
    crates: getCrates(),

    totalBirds: +el("totalBirds").innerText,
    grossWeight: +el("grossTotal").innerText,
    emptyWeight: +el("emptyTotal").innerText,
    netWeight: +el("netTotal").innerText,

    createdAt: serverTimestamp()
  });

  alert("Bill saved successfully");
  location.href = "billing-history.html";
};

/* LOAD BILL */
async function loadBill(id) {
  const snap = await getDoc(
    doc(db, "farmers", currentUser.uid, "bills", id)
  );

  if (!snap.exists()) return;

  const b = snap.data();

  el("billNo").value = b.billNo;
  el("billDate").value = b.date;
  el("traderName").value = b.traderName;
  el("vehicleNo").value = b.vehicleNo;

  emptyBody.innerHTML = "";
  grossBody.innerHTML = "";
  crateBody.innerHTML = "";

  b.emptyWeights.forEach(v => addEmptyRow(v));
  b.grossWeights.forEach(v => addGrossRow(v));
  b.crates.forEach(c => addCrateRow(c.crate, c.birds));

  calculateTotals();
  calcBirds();
}
