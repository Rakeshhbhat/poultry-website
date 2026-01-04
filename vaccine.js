import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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

/* ---------------- FIREBASE CONFIG ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyDHnDFe-sg7hc4I8jSEHR7wIlHUnLfUA8A",
  authDomain: "poultry-record.firebaseapp.com",
  projectId: "poultry-record",
  storageBucket: "poultry-record.firebasestorage.app",
  messagingSenderId: "476624930714",
  appId: "1:476624930714:web:d7847899b8e1f3eb4d5c23"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const el = id => document.getElementById(id);

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const vacRef = doc(db, "farmers", user.uid, "meta", "vaccines");
  const snap = await getDoc(vacRef);

  /* ---------- Render existing images ---------- */
  if (snap.exists()) {
    const data = snap.data();
    renderImage("v1Preview", data.v1);
    renderImage("v2Preview", data.v2);
    renderImage("v3Preview", data.v3);
  }

  el("saveVaccine").onclick = async () => {
    try {
      const urls = {};

      if (el("v1Img").files[0])
        urls.v1 = await upload("v1", el("v1Img").files[0], user.uid);

      if (el("v2Img").files[0])
        urls.v2 = await upload("v2", el("v2Img").files[0], user.uid);

      if (el("v3Img").files[0])
        urls.v3 = await upload("v3", el("v3Img").files[0], user.uid);

      await setDoc(vacRef, urls, { merge: true });

      Object.entries(urls).forEach(([k, v]) =>
        renderImage(`${k}Preview`, v)
      );

      alert("Vaccination details saved successfully ✅");

    } catch (e) {
      console.error(e);
      alert("Error saving vaccination details ❌");
    }
  };
});

/* ---------- Helpers ---------- */

async function upload(key, file, uid) {
  const storageRef = ref(storage, `vaccines/${uid}/${key}.jpg`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

function renderImage(id, url) {
  if (!url) return;

  let img = document.getElementById(id);
  if (!img) {
    img = document.createElement("img");
    img.id = id;
    img.style.maxWidth = "100%";
    img.style.marginTop = "10px";
    document.getElementById("pdfContent").appendChild(img);
  }
  img.src = url;
}
