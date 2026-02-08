import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();
const list = document.getElementById("billList");

auth.onAuthStateChanged(async user => {
  if (!user) return;

  const q = query(
    collection(db, "farmers", user.uid, "bills"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const b = doc.data();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.billNo}</td>
      <td>${b.date}</td>
      <td>${b.traderName}</td>
      <td>${b.netWeight} kg</td>
      <td>
        <button class="btn-secondary btn-sm"
          onclick="openBill('${doc.id}')">
          View
        </button>
      </td>
    `;
    list.appendChild(tr);
  });
});

window.openBill = id => {
  window.location.href = `billing.html?billId=${id}`;
};
