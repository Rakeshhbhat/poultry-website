import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// DOM Elements
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const nameEl = document.getElementById("farmerName");
const msgEl = document.getElementById("msg");

// ---------------- REGISTER ----------------
document.getElementById("registerBtn").onclick = async () => {
  msgEl.innerText = "";

  if (!emailEl.value || !passwordEl.value || !nameEl.value) {
    msgEl.innerText = "Please fill all fields";
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      emailEl.value,
      passwordEl.value
    );

    await setDoc(doc(db, "farmers", userCred.user.uid), {
      name: nameEl.value,
      createdAt: new Date()
    });

    window.location.href = "dashboard.html";
  } catch (error) {
    handleAuthError(error);
  }
};

// ---------------- LOGIN ----------------
document.getElementById("loginBtn").onclick = async () => {
  msgEl.innerText = "";

  if (!emailEl.value || !passwordEl.value) {
    msgEl.innerText = "Please enter email and password";
    return;
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      emailEl.value,
      passwordEl.value
    );

    window.location.href = "dashboard.html";
  } catch (error) {
    handleAuthError(error);
  }
};

// ---------------- ERROR HANDLER ----------------
function handleAuthError(error) {
  console.error(error.code);

  switch (error.code) {
    case "auth/user-not-found":
      msgEl.innerText = "Email not registered. Please register first.";
      break;

    case "auth/wrong-password":
      msgEl.innerText = "Incorrect password. Please try again.";
      break;

    case "auth/invalid-email":
      msgEl.innerText = "Invalid email format.";
      break;

    case "auth/email-already-in-use":
      msgEl.innerText = "Email already registered. Please login.";
      break;

    case "auth/weak-password":
      msgEl.innerText = "Password must be at least 6 characters.";
      break;

    default:
      msgEl.innerText = "Authentication failed. Please try again.";
  }
}
