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

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let chartsReady = false;

/* ================= AUTH ================= */
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

  /* KPIs */
  liveBirds.innerText = totalChicks - (last.mortalityTotal || 0);
  mortPct.innerText = (last.mortalityPct || 0) + "%";
  bwAct.innerText = last.bodyWtActual ?? "-";
  bwStd.innerText = last.bodyWtMin ?? "-";
  fcrAct.innerText = last.fcrActual ?? "-";
  fcrStd.innerText = last.fcrStd ?? "-";

  const labels = rows.map(r => "Day " + r.age);

  /* Charts */
  new Chart(bwChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "BW Actual", data: rows.map(r => r.bodyWtActual || 0) },
        { label: "BW Std", data: rows.map(r => r.bodyWtMin || 0) }
      ]
    }
  });

  new Chart(fcrChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "FCR Actual", data: rows.map(r => r.fcrActual || 0) },
        { label: "FCR Std", data: rows.map(r => r.fcrStd || 0) }
      ]
    }
  });

  new Chart(mortChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Mortality %", data: rows.map(r => r.mortalityPct || 0) }
      ]
    }
  });

  chartsReady = true;
});

/* ================= BUTTON ACTIONS ================= */

/* DASHBOARD PDF */
pdfBtn.onclick = async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const content = document.getElementById("pdfContent");
  const canvas = await html2canvas(content, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("poultry-dashboard.pdf");
};

/* VIEW CHART (SCROLL TO CHARTS) */
viewChartBtn.onclick = () => {
  document.getElementById("bwChart").scrollIntoView({
    behavior: "smooth"
  });
};

/* SHARE CHART (PDF ONLY CHARTS) */
shareChartBtn.onclick = async () => {
  if (!chartsReady) {
    alert("Charts not ready yet");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const charts = ["bwChart", "fcrChart", "mortChart"];
  let y = 10;

  for (const id of charts) {
    const canvas = document.getElementById(id);
    const img = canvas.toDataURL("image/png");

    pdf.addImage(img, "PNG", 10, y, 180, 60);
    y += 65;

    if (y > 250) {
      pdf.addPage();
      y = 10;
    }
  }

  pdf.save("poultry-charts.pdf");
};

/* LOGOUT */
logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
