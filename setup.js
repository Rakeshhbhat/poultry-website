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
  }

 document.getElementById("saveBatch").onclick = async () => {
  const startDate = document.getElementById("startDate").value;
  const totalChicks = Number(document.getElementById("totalChicks").value);

  if (!startDate || !totalChicks || totalChicks <= 0) {
    alert("Please enter valid batch start date and total chicks");
    return;
  }

  await setDoc(doc(db, "farmers", user.uid), {
    batchStartDate: startDate,
    totalChicks: totalChicks
  }, { merge: true });

  window.location.href = "entry.html";
};

});
