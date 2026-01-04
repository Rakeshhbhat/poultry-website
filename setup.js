import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("saveBatch").onclick = async () => {
    const farmerName = document.getElementById("farmerName").value.trim();
    const hatcheryName = document.getElementById("hatcheryName").value.trim();
    const hatcheryCode = document.getElementById("hatcheryCode").value.trim();
    const batchCode = document.getElementById("batchCode").value.trim();
    const startDate = document.getElementById("startDate").value;
    const totalChicks = Number(document.getElementById("totalChicks").value);

    if (!farmerName || !hatcheryName || !hatcheryCode || !batchCode || !startDate || !totalChicks || totalChicks <= 0) {
  alert("Please fill all setup details");
  return;
}


    await setDoc(doc(db, "farmers", user.uid), {
  farmerName,
  hatcheryName,
  hatcheryCode,
  batchCode,
  batchStartDate: startDate,
  totalChicks,
  setupCompleted: true
}, { merge: true });


    window.location.href = "entry.html";
  };
});
