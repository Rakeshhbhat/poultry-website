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
    alert("❌ Please login first");
    return;
  }

  const uid = user.uid;
  const batchId = "batch_legacy";

  alert("⏳ Copying legacy daily records…");

  const legacySnap = await getDocs(
    collection(db, "farmers", uid, "dailyRecords")
  );

  if (legacySnap.empty) {
    alert("❌ No legacy daily records found");
    return;
  }

  let copied = 0;

  for (const d of legacySnap.docs) {
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
      d.data(),
      { merge: true }   // 🔒 safe overwrite protection
    );
    copied++;
  }

  alert(`✅ ${copied} daily records copied successfully`);
});
