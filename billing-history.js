import { getAuth } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth=getAuth();
const db=getFirestore();
const list=document.getElementById("billList");

auth.onAuthStateChanged(async user=>{
  if(!user)return;

  const q=query(
    collection(db,"farmers",user.uid,"bills"),
    orderBy("createdAt","desc")
  );

  const snap=await getDocs(q);
  list.innerHTML="";

  snap.forEach(d=>{
    const b=d.data();
    list.innerHTML+=`
      <tr>
        <td>${b.billNo}</td>
        <td>${b.date}</td>
        <td>${b.traderName}</td>
        <td>${b.netWeight}</td>
        <td>
          <button onclick="openBill('${d.id}')">View</button>
        </td>
      </tr>`;
  });
});

window.openBill=id=>{
  location.href=`billing.html?billId=${id}`;
};
