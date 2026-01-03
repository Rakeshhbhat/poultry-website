import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore, collection, getDocs, doc, getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const farmerSnap = await getDoc(doc(db, "farmers", user.uid));
  if (
  !farmerSnap.exists() ||
  !farmerSnap.data().batchStartDate ||
  !farmerSnap.data().totalChicks
) {
  window.location.href = "setup.html";
  return;
}

  const totalChicks = farmerSnap.data().totalChicks;

  const snap = await getDocs(collection(db, "farmers", user.uid, "dailyRecords"));
  let rows = [];
  snap.forEach(d => rows.push(d.data()));
  rows.sort((a, b) => a.age - b.age);

  const last = rows[rows.length - 1];

  document.getElementById("liveBirds").innerText =
    totalChicks - last.mortalityTotal;

  document.getElementById("mortPct").innerText =
    last.mortalityPct + "%";

  document.getElementById("bwAct").innerText =
    last.bodyWtActual;

  document.getElementById("bwStd").innerText =
    last.bodyWtMin;

  document.getElementById("fcrAct").innerText =
    last.fcrActual;

  document.getElementById("fcrStd").innerText =
    last.fcrStd;

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

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  location.href = "index.html";
};

document.getElementById("pdfBtn").onclick = async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const canvas = await html2canvas(document.getElementById("pdfContent"), { scale: 2 });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
  pdf.save("Poultry_Report.pdf");
};
