import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  // PASTE YOUR CONFIG HERE
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.register = async function () {
  const email = email.value;
  const password = password.value;
  const name = farmerName.value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "farmers", userCred.user.uid), {
    name: name,
    createdAt: new Date()
  });

  window.location.href = "dashboard.html";
};

window.login = async function () {
  const emailVal = email.value;
  const passwordVal = password.value;
  await signInWithEmailAndPassword(auth, emailVal, passwordVal);
  window.location.href = "dashboard.html";
};

