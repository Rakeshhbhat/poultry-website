import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDHnDFe-sg7hc4I8jSEHR7wIlHUnLfUA8A",
  authDomain: "poultry-record.firebaseapp.com",
  projectId: "poultry-record",
  storageBucket: "poultry-record.firebasestorage.app",
  messagingSenderId: "476624930714",
  appId: "1:476624930714:web:d7847899b8e1f3eb4d5c23"
};

/* ================= INIT (ONLY ONCE) ================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= GLOBAL ================= */
let rows = [];
let batchStartDate;

let farmerName = "";
let hatcheryName = "";
let hatcheryCode = "";
let batchCode = "";

/* ================= AUTH ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const farmerRef = doc(db, "farmers", user.uid);
  const farmerSnap = await getDoc(farmerRef);

  if (!farmerSnap.exists()) {
    window.location.href = "setup.html";
    return;
  }

  const farmerData = farmerSnap.data();

  if (!farmerData.batchStartDate || !farmerData.totalChicks) {
    window.location.href = "setup.html";
    return;
  }

  farmerName = farmerData.farmerName || "—";
  hatcheryName = farmerData.hatcheryName || "—";
  hatcheryCode = farmerData.hatcheryCode || "—";
  batchCode = farmerData.batchCode || "—";

  batchStartDate = new Date(farmerData.batchStartDate);
  const totalChicks = farmerData.totalChicks;

  const snap = await getDocs(
    collection(db, "farmers", user.uid, "dailyRecords")
  );

  rows = [];
  snap.forEach(d => rows.push(d.data()));
  rows.sort((a, b) => a.age - b.age);

  if (!rows.length) return;

  const last = rows[rows.length - 1];

  document.getElementById("liveBirds").innerText =
    totalChicks - last.mortalityTotal;

  document.getElementById("mortPct").innerText =
    last.mortalityPct + "%";

  document.getElementById("bwAct").innerText = last.bodyWtActual;
  document.getElementById("bwStd").innerText = last.bodyWtMin;
  document.getElementById("fcrAct").innerText = last.fcrActual;
  document.getElementById("fcrStd").innerText = last.fcrStd;

  const labels = rows.map(r => "Day " + r.age);

  new Chart(bwChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "BW Actual", data: rows.map(r => r.bodyWtActual) },
        { label: "BW Std", data: rows.map(r => r.bodyWtMin) }
      ]
    }
  });

  new Chart(fcrChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "FCR Actual", data: rows.map(r => r.fcrActual) },
        { label: "FCR Std", data: rows.map(r => r.fcrStd) }
      ]
    }
  });

  new Chart(mortChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Mortality %", data: rows.map(r => r.mortalityPct) }
      ]
    }
  });
});

/* ================= LOGOUT ================= */
logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
