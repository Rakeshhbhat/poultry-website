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
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const el = id => document.getElementById(id);
const auth = getAuth();
const db = getFirestore();

let currentUser;
let billId;
let viewMode = false;

el("billDate").valueAsDate = new Date();

/* AUTH */
onAuthStateChanged(auth, async user => {
  if (!user) return location.href = "index.html";
  currentUser = user;

  billId = new URLSearchParams(location.search).get("billId");

  if (billId) {
    viewMode = true;
    loadBill(billId);
    el("saveBill").style.display = "none";
  } else {
    el("billNo").value = await generateBillNo();
  }
});

/* AUTO BILL NO */
async function generateBillNo() {
  const q = query(
    collection(db, "farmers", currentUser.uid, "bills"),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return "001";
  return String(Number(snap.docs[0].data().billNo) + 1).padStart(3, "0");
}

/* WEIGHTS */
const emptyBody = el("emptyBody");
const grossBody = el("grossBody");

el("addEmptyRow").onclick = () => addEmptyRow();
el("addGrossRow").onclick = () => addGrossRow();

function addEmptyRow(v="") {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td><input class="emptyWt" value="${v}" type="number" step="0.001"></td>`;
  tr.querySelector("input").oninput = calculateTotals;
  emptyBody.appendChild(tr);
  calculateTotals();
}

function addGrossRow(v="") {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td><input class="grossWt" value="${v}" type="number" step="0.001"></td>`;
  tr.querySelector("input").oninput = calculateTotals;
  grossBody.appendChild(tr);
  calculateTotals();
}

addEmptyRow(); addGrossRow();

/* BIRDS */
const crateBody = el("crateBody");
el("addCrateRow").onclick = () => addCrateRow();

function addCrateRow(c="", b="") {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="crate" value="${c}"></td>
    <td><input class="birds" value="${b}"></td>
    <td class="rowTotal">0</td>`;
  tr.querySelectorAll("input").forEach(i => i.oninput = calcBirds);
  crateBody.appendChild(tr);
}

addCrateRow();

/* CALCULATIONS */
function calculateTotals() {
  let e = 0, g = 0;
  document.querySelectorAll(".emptyWt").forEach(i => e += +i.value || 0);
  document.querySelectorAll(".grossWt").forEach(i => g += +i.value || 0);
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

/* SAVE */
el("saveBill").onclick = async () => {
  const ref = doc(collection(db,"farmers",currentUser.uid,"bills"));

  await setDoc(ref,{
    billNo: el("billNo").value,
    date: el("billDate").value,
    traderName: el("traderName").value,
    vehicleNo: el("vehicleNo").value,
    emptyWeights:[...document.querySelectorAll(".emptyWt")].map(i=>+i.value||0),
    grossWeights:[...document.querySelectorAll(".grossWt")].map(i=>+i.value||0),
    crates:[...crateBody.querySelectorAll("tr")].map(r=>({
      crate:+r.querySelector(".crate").value||0,
      birds:+r.querySelector(".birds").value||0
    })),
    totalBirds:+el("totalBirds").innerText,
    grossWeight:+el("grossTotal").innerText,
    emptyWeight:+el("emptyTotal").innerText,
    netWeight:+el("netTotal").innerText,
    createdAt:serverTimestamp()
  });

  alert("Bill saved");
  location.href="billing-history.html";
};

/* LOAD */
async function loadBill(id){
  const snap=await getDoc(doc(db,"farmers",currentUser.uid,"bills",id));
  if(!snap.exists())return;
  const b=snap.data();

  el("billNo").value=b.billNo;
  el("billDate").value=b.date;
  el("traderName").value=b.traderName;
  el("vehicleNo").value=b.vehicleNo;

  emptyBody.innerHTML="";
  grossBody.innerHTML="";
  crateBody.innerHTML="";

  (b.emptyWeights||[]).forEach(addEmptyRow);
  (b.grossWeights||[]).forEach(addGrossRow);
  (b.crates||[]).forEach(c=>addCrateRow(c.crate,c.birds));

  calculateTotals();
  calcBirds();
}
