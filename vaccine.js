import { getAuth, onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getApps } from
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";

/* 🔥 REUSE EXISTING FIREBASE APP */
const app = getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const el = id => document.getElementById(id);

console.log("✅ vaccine.js loaded");

/* ================= AUTH ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const vacRef = doc(db, "farmers", user.uid, "meta", "vaccines");
  const snap = await getDoc(vacRef);

  if (snap.exists()) {
    const d = snap.data();
    show("v1Preview", d.v1);
    show("v2Preview", d.v2);
    show("v3Preview", d.v3);
  }

  el("saveVaccine").onclick = async () => saveVaccines(user.uid);
});

/* ================= SAVE ================= */
async function saveVaccines(uid) {
  try {
    const data = {};

    if (el("v1Img").files[0])
      data.v1 = await upload(uid, "v1", el("v1Img").files[0]);

    if (el("v2Img").files[0])
      data.v2 = await upload(uid, "v2", el("v2Img").files[0]);

    if (el("v3Img").files[0])
      data.v3 = await upload(uid, "v3", el("v3Img").files[0]);

    if (!Object.keys(data).length) {
      alert("Please select at least one vaccine image");
      return;
    }

    await setDoc(vacRef(uid), data, { merge: true });

    Object.entries(data).forEach(([k, v]) =>
      show(`${k}Preview`, v)
    );

    alert("✅ Vaccination details saved");

  } catch (e) {
    console.error(e);
    alert("❌ Error saving vaccination");
  }
}

function vacRef(uid) {
  return doc(db, "farmers", uid, "meta", "vaccines");
}

async function upload(uid, key, file) {
  const r = ref(storage, `vaccines/${uid}/${key}.jpg`);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}

function show(id, url) {
  if (url && el(id)) el(id).src = url;
}
