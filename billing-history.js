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

/* AUTH */
onAuthStateChanged(auth, async user => {
  if (!user) return;

  const q = query(
    collection(db, "farmers", user.uid, "bills"),
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
        <button onclick="openBill('${d.id}')">View</button>
      </td>
    `;

    list.appendChild(tr);
  });
});

/* VIEW */
window.openBill = id => {
  location.href = `bill-view.html?billId=${id}`;
};
