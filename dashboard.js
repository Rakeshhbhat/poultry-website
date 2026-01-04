import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyDHnDFe-sg7hc4I8jSEHR7wIlHUnLfUA8A",
  authDomain: "poultry-record.firebaseapp.com",
  projectId: "poultry-record",
  storageBucket: "poultry-record.firebasestorage.app",
  messagingSenderId: "476624930714",
  appId: "1:476624930714:web:d7847899b8e1f3eb4d5c23"
};

/* INIT */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* AUTH */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const farmerRef = doc(db, "farmers", user.uid);
  const farmerSnap = await getDoc(farmerRef);

  if (!farmerSnap.exists()) {
    alert("Farmer setup not found");
    return;
  }

  const farmer = farmerSnap.data();

  if (!farmer.totalChicks) {
    alert("Batch not initialized");
    return;
  }

  const totalChicks = farmer.totalChicks;

  const snap = await getDocs(
    collection(db, "farmers", user.uid, "dailyRecords")
  );

  const rows = [];
  snap.forEach(d => rows.push(d.data()));

  if (!rows.length) {
    alert("No daily records found");
    return;
  }

  rows.sort((a, b) => a.age - b.age);
  const last = rows[rows.length - 1];

  document.getElementById("liveBirds").innerText =
    totalChicks - (last.mortalityTotal || 0);

  document.getElementById("mortPct").innerText =
    (last.mortalityPct || 0) + "%";

  document.getElementById("bwAct").innerText = last.bodyWtActual ?? "-";
  document.getElementById("bwStd").innerText = last.bodyWtMin ?? "-";
  document.getElementById("fcrAct").innerText = last.fcrActual ?? "-";
  document.getElementById("fcrStd").innerText = last.fcrStd ?? "-";

  const labels = rows.map(r => "Day " + r.age);

  new Chart(document.getElementById("bwChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "BW Actual", data: rows.map(r => r.bodyWtActual || 0) },
        { label: "BW Std", data: rows.map(r => r.bodyWtMin || 0) }
      ]
    }
  });

  new Chart(document.getElementById("fcrChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "FCR Actual", data: rows.map(r => r.fcrActual || 0) },
        { label: "FCR Std", data: rows.map(r => r.fcrStd || 0) }
      ]
    }
  });

  new Chart(document.getElementById("mortChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Mortality %", data: rows.map(r => r.mortalityPct || 0) }
      ]
    }
  });
});

/* LOGOUT */
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
