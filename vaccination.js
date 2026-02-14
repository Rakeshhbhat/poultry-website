import { t, translateCommonElements, firebaseApp } from "./firebase.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

translateCommonElements();

// Unsaved changes flag
let isDirty = false;
window.onbeforeunload = (e) => {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = '';
    return t("Unsaved changes");
  }
};
document.body.addEventListener("input", (e) => {
  if (e.target.tagName === "INPUT") isDirty = true;
});

const viewBtn = document.getElementById("viewChartBtn");
if(viewBtn) viewBtn.onclick = () => location.href = "dashboard.html?action=viewChart";
const shareBtn = document.getElementById("shareChartBtn");
if(shareBtn) shareBtn.onclick = () => location.href = "dashboard.html?action=shareChart";

// Translate Page Specifics
const labels = {
  "vacDate": "Administered Date",
  "vacName": "Vaccine Name",
  "vacCost": "Cost",
  "vacNotes": "Notes",
  "vacPhoto": "Photo"
};

for (const [id, key] of Object.entries(labels)) {
  const el = document.getElementById(id);
  if (el && el.previousElementSibling) el.previousElementSibling.innerText = t(key);
}

if(document.querySelector("h2")) document.querySelector("h2").innerText = t("Vaccination Record");
if(document.querySelector("h3")) document.querySelector("h3").innerText = t("Vaccination History");
if(document.getElementById("saveBtn")) document.getElementById("saveBtn").innerText = t("Add Record");

// Translate Placeholders
if(document.getElementById("vacName")) document.getElementById("vacName").placeholder = t("e.g. Lasota, Gumboro");
if(document.getElementById("vacNotes")) document.getElementById("vacNotes").placeholder = t("Optional notes");

const ths = document.querySelectorAll("th");
if(ths.length >= 3) {
  ths[0].innerText = t("Date");
  ths[1].innerText = t("Vaccine Name");
  ths[2].innerText = t("Photo");
}

document.getElementById("vacDate").valueAsDate = new Date();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  const batchId = localStorage.getItem("activeBatchId");
  if (!batchId) {
    location.href = "batch.html";
    return;
  }

  const colRef = collection(db, "farmers", user.uid, "batches", batchId, "vaccinations");

  // --- LOAD ---
  const loadList = async () => {
    const q = query(colRef, orderBy("date", "desc"));
    const snap = await getDocs(q);
    const tbody = document.getElementById("vacList");
    tbody.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();
      const tr = document.createElement("tr");
      
      let imgHtml = "-";
      if (data.photoUrl) {
        imgHtml = `<a href="${data.photoUrl}" target="_blank"><img src="${data.photoUrl}" style="height:40px; border-radius:4px;"></a>`;
      }

      tr.innerHTML = `
        <td>${data.date}</td>
        <td>
          <div style="font-weight:bold">${data.name}</div>
          <div style="font-size:12px; color:#666;">${data.notes || ""}</div>
          ${data.cost ? `<div style="font-size:12px; color:#2e7d32;">${t("Cost")}: ${data.cost}</div>` : ""}
        </td>
        <td>${imgHtml}</td>
        <td><button class="btn-danger" style="padding:5px 10px; font-size:12px;">X</button></td>
      `;

      // Delete Handler
      tr.querySelector("button").onclick = async () => {
        if(confirm("Delete this record?")) {
          await deleteDoc(doc(colRef, d.id));
          if (data.storagePath) {
            try { await deleteObject(ref(storage, data.storagePath)); } catch(e) { console.log(e); }
          }
          loadList();
        }
      };

      tbody.appendChild(tr);
    });
  };

  loadList();

  // --- SAVE ---
  document.getElementById("saveBtn").onclick = async () => {
    isDirty = false;
    const date = document.getElementById("vacDate").value;
    const name = document.getElementById("vacName").value;
    const notes = document.getElementById("vacNotes").value;
    const cost = document.getElementById("vacCost").value;
    const file = document.getElementById("vacPhoto").files[0];

    if (!date || !name) {
      alert(t("Please fill all fields"));
      return;
    }

    document.getElementById("saveBtn").disabled = true;
    document.getElementById("saveBtn").innerText = "Saving...";

    let photoUrl = "";
    let storagePath = "";

    if (file) {
      storagePath = `farmers/${user.uid}/vaccinations/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      photoUrl = await getDownloadURL(storageRef);
    }

    await addDoc(colRef, {
      date, name, notes, cost, photoUrl, storagePath,
      createdAt: new Date()
    });

    alert(t("Saved successfully"));
    location.reload();
  };
});

document.getElementById('logoutBtn').onclick = async () => {
  await signOut(auth);
  localStorage.removeItem("activeBatchId");
  location.href = 'index.html';
};