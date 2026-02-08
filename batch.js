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
  getDoc,
  setDoc,
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

  // 👇 Detect manual navigation (from dashboard)
  const isManual =
    new URLSearchParams(window.location.search).get("manual") === "1";

  const farmerRef = doc(db, "farmers", user.uid);
  const farmerSnap = await getDoc(farmerRef);

  if (!farmerSnap.exists()) {
    window.location.href = "setup.html";
    return;
  }

  const farmer = farmerSnap.data();

  const batchesRef = collection(db, "farmers", user.uid, "batches");
  const snap = await getDocs(batchesRef);

  /* ================= LEGACY AUTO-MIGRATION ================= */
  if (!isManual &&
      snap.empty &&
      farmer.batchStartDate &&
      farmer.totalChicks) {

    const legacyBatchId = "batch_legacy";

    await setDoc(
      doc(db, "farmers", user.uid, "batches", legacyBatchId),
      {
        batchCode: farmer.batchCode || "Legacy Batch",
        hatcheryName: farmer.hatcheryName || "—",
        hatcheryCode: farmer.hatcheryCode || "—",
        batchStartDate: farmer.batchStartDate,
        totalChicks: farmer.totalChicks,
        status: "active",
        createdAt: new Date()
      }
    );

    await updateDoc(farmerRef, {
      activeBatchId: legacyBatchId
    });

    localStorage.setItem("activeBatchId", legacyBatchId);
    window.location.href = "dashboard.html";
    return;
  }

  /* ================= NO BATCHES AT ALL ================= */
  if (!isManual && snap.empty) {
    window.location.href = "setup.html";
    return;
  }

  /* ================= SINGLE BATCH (AUTO ONLY) ================= */
  if (!isManual && snap.size === 1) {
    const d = snap.docs[0];

    await updateDoc(farmerRef, {
      activeBatchId: d.id
    });

    localStorage.setItem("activeBatchId", d.id);
    window.location.href = "dashboard.html";
    return;
  }

  /* ================= SHOW BATCH LIST ================= */
  listEl.innerHTML = "";

  snap.forEach(s => {
    const b = s.data();

    const btn = document.createElement("button");
    btn.style.width = "100%";
    btn.style.marginBottom = "10px";

    btn.className =
      b.status === "active"
        ? "btn-primary"
        : "btn-secondary";

    btn.textContent =
      `${b.batchCode} (${b.status})`;

    btn.onclick = async () => {
      await updateDoc(farmerRef, {
        activeBatchId: s.id
      });

      localStorage.setItem("activeBatchId", s.id);
      window.location.href = "dashboard.html";
    };

    listEl.appendChild(btn);
  });
});
