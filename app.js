import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
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

/* ================= INITIALIZE ================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= DOM ELEMENTS ================= */
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const nameEl = document.getElementById("farmerName");
const msgEl = document.getElementById("msg");

/* ================= REGISTER ================= */
document.getElementById("registerBtn").onclick = async () => {
  msgEl.style.color = "red";
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
      email: emailEl.value,
      createdAt: new Date()
    });

    window.location.href = "dashboard.html";
  } catch (error) {
    handleAuthError(error);
  }
};

/* ================= LOGIN ================= */
document.getElementById("loginBtn").onclick = async () => {
  msgEl.style.color = "red";
  msgEl.innerText = "";

  if (!emailEl.value || !passwordEl.value) {
    msgEl.innerText = "Please enter email and password";
    return;
  }

  // Show Loader
  const loader = document.getElementById("loginLoader");
  const loaderText = document.getElementById("loaderText");
  const loaderIcon = document.getElementById("loaderIcon");
  
  if (loader) {
    loader.style.display = "flex";
    loaderText.innerText = "Logging in...";
    loaderIcon.innerText = "🐔";
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      emailEl.value,
      passwordEl.value
    );

    // Success Animation
    if (loader) {
      loaderText.innerText = "Login Successful!";
      loaderText.style.color = "green";
      loaderText.style.fontWeight = "bold";
      loaderIcon.innerText = "🐣"; // Hatching chick
    }
    
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);

  } catch (error) {
    if (loader) loader.style.display = "none";
    
    // Shake effect on error
    const card = document.querySelector(".card");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 500);
    }
    
    handleAuthError(error);
  }
};

/* ================= FORGOT PASSWORD ================= */
document.getElementById("forgotPassword").onclick = async () => {
  msgEl.style.color = "red";
  msgEl.innerText = "";

  if (!emailEl.value) {
    msgEl.innerText = "Enter your email to reset password";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailEl.value);
    msgEl.style.color = "green";
    msgEl.innerText =
      "Password reset link sent. Check inbox or spam.";
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      msgEl.innerText = "Email not registered";
    } else if (error.code === "auth/invalid-email") {
      msgEl.innerText = "Invalid email format";
    } else {
      msgEl.innerText = "Failed to send reset email";
    }
  }
};

/* ================= ERROR HANDLER ================= */
function handleAuthError(error) {
  console.error(error.code);

  switch (error.code) {
    case "auth/user-not-found":
      msgEl.innerText = "Email not registered. Please register first.";
      break;
    case "auth/wrong-password":
      msgEl.innerText = "Incorrect password.";
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
      msgEl.innerText = "Authentication failed. Try again.";
  }
}
