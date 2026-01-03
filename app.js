// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } 
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// firebaseConfig 
const firebaseConfig = {
  apiKey: "AIzaSyDHnDFe-sg7hc4I8jSEHR7wIlHUnLfUA8A",
  authDomain: "poultry-record.firebaseapp.com",
  projectId: "poultry-record",
  storageBucket: "poultry-record.firebasestorage.app",
  messagingSenderId: "476624930714",
  appId: "1:476624930714:web:d7847899b8e1f3eb4d5c23"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const email = document.getElementById("email");
const password = document.getElementById("password");
const farmerName = document.getElementById("farmerName");

// Register
document.getElementById("registerBtn").addEventListener("click", async () => {
  const userCred = await createUserWithEmailAndPassword(
    auth,
    email.value,
    password.value
  );

  await setDoc(doc(db, "farmers", userCred.user.uid), {
    name: farmerName.value,
    createdAt: new Date()
  });

  window.location.href = "dashboard.html";
});

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  await signInWithEmailAndPassword(
    auth,
    email.value,
    password.value
  );

  window.location.href = "dashboard.html";
});
