import "./firebase.js";
import { firebaseApp } from "./firebase.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const listEl = document.getElementById("batchList");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const snap = await getDocs(
    collection(db, "farmers", user.uid, "batches")
  );

  // 🔴 CASE 1: No batches → go create first batch
  if (snap.empty) {
    window.location.href = "setup.html";
    return;
  }

  // 🔴 CASE 2: Only one batch → auto select
  if (snap.size === 1) {
    const d = snap.docs[0];

    await updateDoc(
      doc(db, "farmers", user.uid),
      { activeBatchId: d.id }
    );

    localStorage.setItem("activeBatchId", d.id);
    window.location.href = "dashboard.html";
    return;
  }

  // 🟢 CASE 3: Multiple batches → show selector
  listEl.innerHTML = "";

  snap.forEach(s => {
    const b = s.data();

    const btn = document.createElement("button");
    btn.className =
      b.status === "active"
        ? "btn-primary"
        : "btn-secondary";

    btn.textContent =
      `${b.batchCode} (${b.status})`;

    btn.onclick = async () => {
      await updateDoc(
        doc(db, "farmers", user.uid),
        { activeBatchId: s.id }
      );

      localStorage.setItem("activeBatchId", s.id);
      window.location.href = "dashboard.html";
    };

    listEl.appendChild(btn);
  });
});
