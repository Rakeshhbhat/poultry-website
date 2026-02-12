import { t, getLang, translateCommonElements } from "./firebase.js";
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

/* ================= LANGUAGE SELECTOR ================= */
const langContainer = document.createElement("div");
langContainer.style.position = "absolute";
langContainer.style.top = "10px";
langContainer.style.right = "10px";
langContainer.style.zIndex = "1000";

const langSelect = document.createElement("select");
langSelect.innerHTML = `
  <option value="en">English</option>
  <option value="kn">ಕನ್ನಡ</option>
`;
langSelect.value = getLang();
langSelect.style.padding = "5px";
langSelect.style.borderRadius = "5px";

langSelect.onchange = () => {
  localStorage.setItem("appLang", langSelect.value);
  location.reload();
};

langContainer.appendChild(langSelect);
document.body.appendChild(langContainer);

/* ================= APPLY TRANSLATIONS ================= */
// Inject global styles (Background Image)
translateCommonElements();

function applyLoginTranslations() {
  const setTxt = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.innerText = t(key);
  };
  
  if(document.getElementById("email")) document.getElementById("email").placeholder = t("Email");
  if(document.getElementById("password")) document.getElementById("password").placeholder = t("Password");
  if(document.getElementById("farmerName")) document.getElementById("farmerName").placeholder = t("Farmer Name");

  // Translate Labels (if they exist before inputs)
  const labels = {
    "email": "Email",
    "password": "Password",
    "farmerName": "Farmer Name"
  };
  for (const [id, key] of Object.entries(labels)) {
    const el = document.getElementById(id);
    if (el && el.previousElementSibling && el.previousElementSibling.tagName === "LABEL") {
      el.previousElementSibling.innerText = t(key);
    }
  }
}

/* ================= DOM ELEMENTS ================= */
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const nameEl = document.getElementById("farmerName");
const msgEl = document.getElementById("msg");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const forgotPasswordLink = document.getElementById("forgotPassword");
const farmerNameLabel = nameEl ? (Array.from(document.querySelectorAll('label')).find(l => l.htmlFor === 'farmerName') || nameEl.previousElementSibling) : null;

/* ================= HANDLERS ================= */
const handleRegister = async () => {
  msgEl.style.color = "red";
  msgEl.innerText = "";

  if (!emailEl.value || !passwordEl.value || !nameEl.value) {
    msgEl.innerText = t("Please fill all fields");
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

const handleLogin = async () => {
  msgEl.style.color = "red";
  msgEl.innerText = "";

  if (!emailEl.value || !passwordEl.value) {
    msgEl.innerText = t("Please enter email and password");
    return;
  }

  // Show Loader
  const loader = document.getElementById("loginLoader");
  const loaderText = document.getElementById("loaderText");
  const loaderIcon = document.getElementById("loaderIcon");
  
  if (loader) {
    loader.style.display = "flex";
    loaderText.innerText = t("Logging in...");
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
      loaderText.innerText = t("Login Successful!");
      loaderText.style.color = "green";
      loaderText.style.fontWeight = "bold";
      loaderIcon.innerText = "🐣"; // Hatching chick
    }
    
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);

  } catch (error) {
    if (loader) {
      // Egg break animation for failure
      loaderText.innerText = t("Login Failed");
      loaderText.style.color = "#d32f2f";
      loaderIcon.innerText = "🍳"; // Broken/Fried egg
      
      setTimeout(() => {
        loader.style.display = "none";
        loaderIcon.innerText = "🐔"; // Reset
      }, 2000);
    }
    
    // Shake effect on error
    const card = document.querySelector(".card");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 500);
    }
    
    handleAuthError(error);
  }
};

const handleForgotPassword = async () => {
  msgEl.style.color = "red";
  msgEl.innerText = "";

  if (!emailEl.value) {
    msgEl.innerText = t("Enter your email to reset password");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailEl.value);
    msgEl.style.color = "green";
    msgEl.innerText = t("Password reset link sent. Check inbox or spam.");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      msgEl.innerText = t("Email not registered");
    } else if (error.code === "auth/invalid-email") {
      msgEl.innerText = t("Invalid email format");
    } else {
      msgEl.innerText = t("Failed to send reset email");
    }
  }
};

/* ================= UI MODE SWITCHER ================= */
function setUIMode(isRegister) {
    msgEl.innerText = "";

    if (isRegister) {
        // --- REGISTER VIEW ---
        if (nameEl) nameEl.style.display = 'block';
        if (farmerNameLabel) farmerNameLabel.style.display = 'block';
        
        loginBtn.style.display = 'none';
        registerBtn.innerText = t("Register");
        registerBtn.onclick = handleRegister;

        forgotPasswordLink.innerText = t("Back to Login");
        forgotPasswordLink.onclick = (e) => { e.preventDefault(); setUIMode(false); };
    } else {
        // --- LOGIN VIEW ---
        if (nameEl) nameEl.style.display = 'none';
        if (farmerNameLabel) farmerNameLabel.style.display = 'none';

        loginBtn.style.display = 'block';
        loginBtn.innerText = t("Login");
        loginBtn.onclick = handleLogin;

        registerBtn.innerText = t("Register");
        registerBtn.onclick = () => setUIMode(true);

        forgotPasswordLink.innerText = t("Forgot Password?");
        forgotPasswordLink.onclick = handleForgotPassword;
    }
}

// Initial page setup
applyLoginTranslations();
setUIMode(false);

/* ================= ERROR HANDLER ================= */
function handleAuthError(error) {
  console.error(error.code);

  switch (error.code) {
    case "auth/user-not-found":
      msgEl.innerText = t("Email not registered");
      break;
    case "auth/wrong-password":
      msgEl.innerText = t("Incorrect password.");
      break;
    case "auth/invalid-email":
      msgEl.innerText = t("Invalid email format.");
      break;
    case "auth/email-already-in-use":
      msgEl.innerText = t("Email already registered. Please login.");
      break;
    case "auth/weak-password":
      msgEl.innerText = t("Password must be at least 6 characters.");
      break;
    default:
      msgEl.innerText = t("Authentication failed. Try again.");
  }
}
