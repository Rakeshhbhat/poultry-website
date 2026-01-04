import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

import {
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const storage = getStorage(app);

document.getElementById("saveVaccine").onclick = async () => {
  const uploads = [
    { id: "v1Img", key: "v1" },
    { id: "v2Img", key: "v2" },
    { id: "v3Img", key: "v3" }
  ];

  for (const u of uploads) {
    const file = document.getElementById(u.id).files[0];
    if (!file) continue;

    const imgRef = ref(storage, `vaccinations/${auth.currentUser.uid}/${u.key}.jpg`);
    await uploadBytes(imgRef, file);

    const url = await getDownloadURL(imgRef);

    await setDoc(
      doc(db, "farmers", auth.currentUser.uid, "vaccination", u.key),
      {
        imageUrl: url,
        uploadedAt: new Date()
      },
      { merge: true }
    );
  }

  alert("Vaccination details saved");
};
