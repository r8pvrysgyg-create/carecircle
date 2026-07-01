import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";


// 🔥 PUT YOUR FIREBASE CONFIG HERE (you will get this later)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

document.getElementById("loginBtn").onclick = () => {
  signInWithPopup(auth, provider);
};

document.getElementById("logoutBtn").onclick = () => {
  signOut(auth);
};

onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("user").innerText = "Logged in as " + user.email;
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline";
    loadNotes();
  } else {
    document.getElementById("user").innerText = "";
    document.getElementById("loginBtn").style.display = "inline";
    document.getElementById("logoutBtn").style.display = "none";
  }
});

document.getElementById("addNote").onclick = async () => {
  const text = document.getElementById("noteInput").value;

  await addDoc(collection(db, "notes"), {
    text,
    author: auth.currentUser.email,
    timestamp: serverTimestamp()
  });

  document.getElementById("noteInput").value = "";
  loadNotes();
};

async function loadNotes() {
  const snapshot = await getDocs(collection(db, "notes"));
  const notesDiv = document.getElementById("notes");

  notesDiv.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    notesDiv.innerHTML += `
      <div class="note">
        <b>${data.author}</b><br>
        ${data.text}
      </div>
    `;
  });
}
