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
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login first");
    return;
  }

  const uid = user.uid;

  const farmerRef = doc(db, "farmers", uid);
  const farmerSnap = await getDoc(farmerRef);

  if (!farmerSnap.exists()) {
    alert("Farmer document not found");
    return;
  }

  const farmer = farmerSnap.data();

  // 🔒 Stop if already migrated
  const batchesSnap = await getDocs(
    collection(db, "farmers", uid, "batches")
  );

  if (!batchesSnap.empty) {
    alert("Migration already done");
    return;
  }

  if (!farmer.batchStartDate || !farmer.totalChicks) {
    alert("No legacy batch found");
    return;
  }

  const legacyBatchId = "batch_legacy";

  console.log("⏳ Creating legacy batch…");

  // 1️⃣ Create batch document
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

  console.log("✅ Batch document created");

  // 2️⃣ Copy daily records
  const oldDays = await getDocs(
    collection(db, "farmers", uid, "dailyRecords")
  );

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
  }

  console.log("✅ Daily records copied");

  // 3️⃣ Set active batch
  await updateDoc(farmerRef, {
    activeBatchId: legacyBatchId
  });

  console.log("🎉 Migration completed successfully");
  alert("Migration completed successfully");
});
