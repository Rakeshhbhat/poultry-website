import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { standardData } from "./standardData.js";

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

  const farmerRef = doc(db, "farmers", user.uid);
  const farmerSnap = await getDoc(farmerRef);

  const totalChicks = farmerSnap.data().totalChicks;
  const startDate = new Date(farmerSnap.data().batchStartDate);
  const today = new Date();

  const age =
    Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

  document.getElementById("dayInfo").innerText = `Day ${age}`;

  // 🔁 Fetch previous day
  let prevMort = 0, prevFeedBal = 0, prevCumFeed = 0;

  if (age > 1) {
    const prevRef = doc(db, "farmers", user.uid, "dailyRecords", `day_${age - 1}`);
    const prevSnap = await getDoc(prevRef);

    if (prevSnap.exists()) {
      prevMort = prevSnap.data().mortalityTotal || 0;
      prevFeedBal = prevSnap.data().feedBalance || 0;
      prevCumFeed = prevSnap.data().cumFeedActual || 0;
    }
  }

  document.getElementById("saveDay").onclick = async () => {
    const mortDaily = Number(mortalityDaily.value || 0);
    const feedRec = Number(feedReceived.value || 0);
    const feedUsed = Number(feedUsed.value || 0);
    const bwActual = Number(bodyWtActual.value || 0);

    const mortTotal = prevMort + mortDaily;
    const mortPct = ((mortTotal / totalChicks) * 100).toFixed(2);

    const feedBal = prevFeedBal + feedRec - feedUsed;

    const liveBirds = totalChicks - mortTotal;

    const feedIntakeAct =
      liveBirds > 0 ? ((feedUsed * 1000) / liveBirds).toFixed(2) : 0;

    const cumFeedAct =
      prevCumFeed + (feedUsed * 1000);

    const fcrAct =
      bwActual > 0
        ? ((cumFeedAct / 1000) / (bwActual / 1000)).toFixed(2)
        : 0;

    const std = standardData[age] || {};

    // DISPLAY
    mortTotalSpan.innerText = mortTotal;
    mortPctSpan.innerText = mortPct;
    feedBalSpan.innerText = feedBal;
    fiStd.innerText = std.feedIntake || "-";
    fiAct.innerText = feedIntakeAct;
    cumStd.innerText = std.cumFeed || "-";
    cumAct.innerText = cumFeedAct;
    bwMin.innerText = std.bodyWt || "-";
    fcrStd.innerText = std.fcr || "-";
    fcrAct.innerText = fcrAct;

    // SAVE FULL ROW
    await setDoc(
      doc(db, "farmers", user.uid, "dailyRecords", `day_${age}`),
      {
        date: today,
        age,
        mortalityDaily: mortDaily,
        mortalityTotal: mortTotal,
        mortalityPct: mortPct,
        feedReceived: feedRec,
        feedUsed,
        feedBalance: feedBal,
        feedIntakeStd: std.feedIntake,
        feedIntakeActual: feedIntakeAct,
        cumFeedStd: std.cumFeed,
        cumFeedActual: cumFeedAct,
        bodyWtMin: std.bodyWt,
        bodyWtActual: bwActual,
        fcrStd: std.fcr,
        fcrActual: fcrAct
      },
      { merge: true }
    );

    alert("Day saved successfully");
  };
});
