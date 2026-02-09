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

  /* ================= SHOW BATCH LIST ================= */
  listEl.innerHTML = "";

  const batches = [];
  snap.forEach(doc => batches.push({ id: doc.id, ...doc.data() }));

  // Sort by date descending (newest first)
  batches.sort((a, b) => {
    const tA = a.createdAt?.seconds || 0;
    const tB = b.createdAt?.seconds || 0;
    return tB - tA;
  });

  const activeBatches = batches.filter(b => b.status === "active");
  const historyBatches = batches.filter(b => b.status !== "active");

  // --- Helper to create button ---
  const createBtn = (b, isActive) => {
    const btn = document.createElement("button");
    btn.style.width = "100%";
    btn.style.marginBottom = "10px";
    btn.className = isActive ? "btn-primary" : "btn-secondary";
    
    const dateStr = b.batchStartDate || "";
    btn.innerHTML = `
      <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
        <span>${b.batchCode || "Batch"}</span>
        <span style="font-size:0.8em; opacity:0.8">${dateStr}</span>
      </div>
    `;

    btn.onclick = async () => {
      await updateDoc(farmerRef, {
        activeBatchId: b.id
      });

      localStorage.setItem("activeBatchId", b.id);
      window.location.href = "dashboard.html";
    };
    return btn;
  };

  // --- Render Active Section ---
  const h3Active = document.createElement("h3");
  h3Active.innerText = "Current Batch(es)";
  listEl.appendChild(h3Active);

  if (activeBatches.length === 0) {
    const p = document.createElement("p");
    p.innerText = "No active batches.";
    p.style.color = "#888";
    p.style.fontSize = "14px";
    listEl.appendChild(p);
  } else {
    activeBatches.forEach(b => listEl.appendChild(createBtn(b, true)));
  }

  // --- Render History Section ---
  const h3History = document.createElement("h3");
  h3History.innerText = "Previous Batches";
  h3History.style.marginTop = "20px";
  h3History.style.borderTop = "1px solid #eee";
  h3History.style.paddingTop = "15px";
  listEl.appendChild(h3History);

  if (historyBatches.length === 0) {
    const p = document.createElement("p");
    p.innerText = "No history available.";
    p.style.color = "#888";
    p.style.fontSize = "14px";
    listEl.appendChild(p);
  } else {
    historyBatches.forEach(b => listEl.appendChild(createBtn(b, false)));
  }
});
