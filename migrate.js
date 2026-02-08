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
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login first");
    return;
  }

  const uid = user.uid;
  const batchId = "batch_legacy";

  alert("⏳ Copying legacy daily records…");

  const oldSnap = await getDocs(
    collection(db, "farmers", uid, "dailyRecords")
  );

  if (oldSnap.empty) {
    alert("❌ No legacy daily records found");
    return;
  }

  let count = 0;

  for (const d of oldSnap.docs) {
    await setDoc(
      doc(
        db,
        "farmers",
        uid,
        "batches",
        batchId,
        "dailyRecords",
        d.id
      ),
      d.data()
    );
    count++;
  }

  alert(`✅ ${count} daily records copied successfully`);
});
