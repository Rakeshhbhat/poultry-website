/* HELPERS */
const el = id => document.getElementById(id);

/* FIREBASE */
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

/* INIT */
el("billDate").valueAsDate = new Date();
el("billNo").value = "AUTO";

/* AUTH */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;

  const billId = new URLSearchParams(location.search).get("billId");
  if (billId) loadBill(billId);
});

/* WEIGHTS */
const emptyBody = el("emptyBody");
const grossBody = el("grossBody");

el("addEmptyRow").onclick = () => addEmptyRow();
el("addGrossRow").onclick = () => addGrossRow();

function addEmptyRow(val = "") {
  emptyBody.insertAdjacentHTML("beforeend", `
    <tr><td><input class="emptyWt" type="number" step="0.001" value="${val}"></td></tr>
  `);
  calculateTotals();
}

function addGrossRow(val = "") {
  grossBody.insertAdjacentHTML("beforeend", `
    <tr><td><input class="grossWt" type="number" step="0.001" value="${val}"></td></tr>
  `);
  calculateTotals();
}

addEmptyRow(); addEmptyRow(); addEmptyRow();
addGrossRow(); addGrossRow(); addGrossRow();

/* BIRDS */
const crateBody = el("crateBody");
el("addCrateRow").onclick = () => addCrateRow();

function addCrateRow(c="", b="") {
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

/* CALCS */
function calculateTotals() {
  let e = 0, g = 0;
  document.querySelectorAll(".emptyWt").forEach(i => e += (+i.value || 0)*1000);
  document.querySelectorAll(".grossWt").forEach(i => g += (+i.value || 0)*1000);

  el("emptyTotal").innerText = (e/1000).toFixed(3);
  el("grossTotal").innerText = (g/1000).toFixed(3);
  el("netTotal").innerText = ((g-e)/1000).toFixed(3);
}

function calcBirds() {
  let t = 0;
  crateBody.querySelectorAll("tr").forEach(r => {
    const c = r.querySelector(".crate")?.value || 0;
    const b = r.querySelector(".birds")?.value || 0;
    r.querySelector(".rowTotal").innerText = c*b;
    t += c*b;
  });
  el("totalBirds").innerText = t;
}

/* SAVE */
el("saveBill").onclick = async () => {
  await addDoc(
    collection(db, "farmers", currentUser.uid, "bills"),
    {
      billNo: el("billNo").value,
      date: el("billDate").value,
      traderName: el("traderName").value,
      vehicleNo: el("vehicleNo").value,
      totalBirds: +el("totalBirds").innerText,
      grossWeight: +el("grossTotal").innerText,
      emptyWeight: +el("emptyTotal").innerText,
      netWeight: +el("netTotal").innerText,
      createdAt: serverTimestamp()
    }
  );
  alert("Bill saved");
};

/* LOAD (VIEW MODE) */
async function loadBill(id) {
  const snap = await getDoc(doc(db,"farmers",currentUser.uid,"bills",id));
  if (!snap.exists()) return;
  const b = snap.data();

  el("billNo").value = b.billNo;
  el("billDate").value = b.date;
  el("traderName").value = b.traderName;
  el("vehicleNo").value = b.vehicleNo;
}
