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


// 🔥 YOUR FIREBASE CONFIG (FROM CONSOLE)
const firebaseConfig = {
  apiKey: "AIzaSyD6SWLx-74wjrZMTnfENcsn8DhSjYMsmN4",
  authDomain: "carecircle-a0cfb.firebaseapp.com",
  projectId: "carecircle-a0cfb",
  storageBucket: "carecircle-a0cfb.appspot.com",
  messagingSenderId: "599284379254",
  appId: "1:599284379254:web:07fbf9a971c82cd02e7957"
};


// INIT FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();


// LOGIN
document.getElementById("loginBtn").onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

// LOGOUT
document.getElementById("logoutBtn").onclick = () => {
  signOut(auth);
};


// AUTH STATE
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("user").innerText =
      "Logged in as: " + user.email;

    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline";

    loadNotes();
  } else {
    document.getElementById("user").innerText = "";

    document.getElementById("loginBtn").style.display = "inline";
    document.getElementById("logoutBtn").style.display = "none";
  }
});


// ADD NOTE
document.getElementById("addNote").onclick = async () => {
  const text = document.getElementById("noteInput").value;

  if (!text) return;

  await addDoc(collection(db, "notes"), {
    text,
    author: auth.currentUser.email,
    timestamp: serverTimestamp()
  });

  document.getElementById("noteInput").value = "";
  loadNotes();
};


// LOAD NOTES
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
