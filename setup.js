import { t, translateCommonElements } from "./firebase.js";
import { firebaseApp } from "./firebase.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

/* ================= TRANSLATE UI ================= */
// Setup page doesn't have sidebar, but we can use t() directly
const h2 = document.querySelector("h2");
if(h2) h2.innerText = t("Create New Batch");

const p = document.querySelector(".card p");
if(p) p.innerText = t("Fill details to start a new batch. Previous active batch will be closed automatically.");

const labels = {
  "farmerName": "Farmer / Farm Name",
  "hatcheryName": "Hatchery Name",
  "hatcheryCode": "Hatchery Code",
  "batchCode": "Batch / Shed Code",
  "startDate": "Batch Start Date",
  "totalChicks": "Total Chicks Placed"
};

for (const [id, key] of Object.entries(labels)) {
  const el = document.getElementById(id);
  if (el && el.previousElementSibling) el.previousElementSibling.innerText = t(key);
}

if(document.getElementById("saveBatch")) document.getElementById("saveBatch").innerText = t("Save & Start Batch");
const cancelBtn = document.querySelector(".btn-secondary");
if(cancelBtn) cancelBtn.innerText = t("Cancel");

if(document.getElementById("totalChicks")) document.getElementById("totalChicks").placeholder = t("e.g. 4700");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  const farmerRef = doc(db, "farmers", user.uid);
  const farmerSnap = await getDoc(farmerRef);

  let hasAnyBatch = false;

  const batchSnap = await getDocs(
    collection(db, "farmers", user.uid, "batches")
  );

  if (!batchSnap.empty) {
    hasAnyBatch = true;
  }

  /* ================= FARMER NAME LOGIC ================= */
  if (farmerSnap.exists() && hasAnyBatch) {
    // ✅ Existing farmer → lock name
    farmerName.value = farmerSnap.data().farmerName || "";
    farmerName.readOnly = true;
    farmerName.style.background = "#f5f5f5";
  } else {
    // 🆕 First time → allow input
    farmerName.readOnly = false;
  }

  /* ================= SAVE BATCH ================= */
  document.getElementById("saveBatch").onclick = async () => {
    const batchId = "batch_" + Date.now();

    /* -------- Save farmer name ONLY once -------- */
    if (!farmerSnap.exists() || !hasAnyBatch) {
      await setDoc(
        farmerRef,
        { farmerName: farmerName.value.trim() },
        { merge: true }
      );
    }

    const data = {
      hatcheryName: hatcheryName.value.trim(),
      hatcheryCode: hatcheryCode.value.trim(),
      batchCode: batchCode.value.trim(),
      batchStartDate: startDate.value,
      totalChicks: Number(totalChicks.value),
      status: "active",
      createdAt: new Date()
    };

    // 🔒 Close existing active batch
    const old = await getDocs(
      collection(db, "farmers", user.uid, "batches")
    );

    for (const d of old.docs) {
      if (d.data().status === "active") {
        await updateDoc(d.ref, { status: "closed" });
      }
    }

    await setDoc(
      doc(db, "farmers", user.uid, "batches", batchId),
      data
    );

    await updateDoc(farmerRef, {
      activeBatchId: batchId
    });

    localStorage.setItem("activeBatchId", batchId);
    location.href = "entry.html";
  };
});
