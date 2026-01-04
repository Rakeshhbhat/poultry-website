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

const app = getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const el = id => document.getElementById(id);

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const refDoc = doc(db, "farmers", user.uid, "meta", "vaccines");
  const snap = await getDoc(refDoc);

  if (snap.exists()) {
    const d = snap.data();
    if (d.v1) el("v1Preview").src = d.v1;
    if (d.v2) el("v2Preview").src = d.v2;
    if (d.v3) el("v3Preview").src = d.v3;
  }

  el("saveVaccine").onclick = () => saveVaccines(user.uid);
});

async function saveVaccines(uid) {
  const data = {};

  if (el("v1Img").files[0])
    data.v1 = await upload(uid, "v1", el("v1Img").files[0]);

  if (el("v2Img").files[0])
    data.v2 = await upload(uid, "v2", el("v2Img").files[0]);

  if (el("v3Img").files[0])
    data.v3 = await upload(uid, "v3", el("v3Img").files[0]);

  if (!Object.keys(data).length) {
    alert("Select at least one image");
    return;
  }

  await setDoc(
    doc(db, "farmers", uid, "meta", "vaccines"),
    data,
    { merge: true }
  );

  alert("Vaccination saved");
}

async function upload(uid, key, file) {
  const r = ref(storage, `vaccines/${uid}/${key}.jpg`);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}
