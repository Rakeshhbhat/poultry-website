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
  getDoc,        // ✅ FIXED
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

alert("Migration script loaded");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("❌ Not logged in. Please login first.");
    return;
  }

  alert("✅ Logged in as: " + user.uid);

  try {
    const uid = user.uid;

    const farmerRef = doc(db, "farmers", uid);
    const farmerSnap = await getDoc(farmerRef);

    if (!farmerSnap.exists()) {
      alert("❌ Farmer document not found");
      return;
    }

    const farmer = farmerSnap.data();

    const batchesSnap = await getDocs(
      collection(db, "farmers", uid, "batches")
    );

    if (!batchesSnap.empty) {
      alert("ℹ️ Migration already done. Batches exist.");
      return;
    }

    if (!farmer.batchStartDate || !farmer.totalChicks) {
      alert("ℹ️ No legacy batch found to migrate.");
      return;
    }

    const legacyBatchId = "batch_legacy";

    alert("⏳ Creating legacy batch…");

    await setDoc(
      doc(db, "farmers", uid, "batches", legacyBatchId),
      {
        batchCode: farmer.batchCode || "Legacy Batch",
        batchStartDate: farmer.batchStartDate,
        hatcheryName: farmer.hatcheryName || "—",
        hatcheryCode: farmer.hatcheryCode || "—",
        totalChicks: farmer.totalChicks,
        status: "active",
        createdAt: new Date()
      }
    );

    alert("✅ Batch document created");

    const oldDays = await getDocs(
      collection(db, "farmers", uid, "dailyRecords")
    );

    let count = 0;

    for (const d of oldDays.docs) {
      await setDoc(
        doc(
          db,
          "farmers",
          uid,
          "batches",
          legacyBatchId,
          "dailyRecords",
          d.id
        ),
        d.data()
      );
      count++;
    }

    alert(`✅ ${count} daily records copied`);

    await updateDoc(farmerRef, {
      activeBatchId: legacyBatchId
    });

    alert("🎉 Migration completed successfully");

  } catch (err) {
    console.error(err);
    alert("❌ Migration failed. Check console.");
  }
});
