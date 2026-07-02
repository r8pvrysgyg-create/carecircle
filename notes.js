import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

import { auth, db } from "./firebase.js";

export async function addNote() {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to add notes.");
    return;
  }

  const input = document.getElementById("noteInput");
  const text = input.value.trim();

  if (!text) return;

  await addDoc(collection(db, "notes"), {
    text,
    author: user.email,
    createdAt: serverTimestamp()
  });

  input.value = "";
  await loadNotes();
}

export async function loadNotes() {
  const notesDiv = document.getElementById("notes");
  const recentNotesDiv = document.getElementById("recentNotes");

  notesDiv.innerHTML = "";
  recentNotesDiv.innerHTML = "";

  const snapshot = await getDocs(collection(db, "notes"));
  const notes = [];

  snapshot.forEach(doc => {
    notes.push(doc.data());
  });

  notes.reverse();

  if (notes.length === 0) {
    notesDiv.innerHTML = "<p>No notes yet.</p>";
    recentNotesDiv.innerHTML = "<p>No recent notes.</p>";
    return;
  }

  notes.forEach(note => {
    notesDiv.innerHTML += `
      <div class="item">
        <strong>${note.author}</strong>
        <p>${note.text}</p>
      </div>
    `;
  });

  notes.slice(0, 3).forEach(note => {
    recentNotesDiv.innerHTML += `
      <div class="small-item">
        <strong>${note.author}</strong>
        <p>${note.text}</p>
      </div>
    `;
  });
}
