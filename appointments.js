import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

import { auth, db } from "./firebase.js";

export async function addAppointment() {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to add appointments.");
    return;
  }

  const person = document.getElementById("apptPerson").value.trim();
  const doctor = document.getElementById("apptDoctor").value.trim();
  const location = document.getElementById("apptLocation").value.trim();
  const driver = document.getElementById("apptDriver").value.trim();
  const date = document.getElementById("apptDate").value;
  const time = document.getElementById("apptTime").value;
  const notes = document.getElementById("apptNotes").value.trim();

  if (!person || !doctor || !date) {
    alert("Please enter at least person, doctor/visit type, and date.");
    return;
  }

  await addDoc(collection(db, "appointments"), {
    person,
    doctor,
    location,
    driver,
    date,
    time,
    notes,
    createdBy: user.email,
    createdAt: serverTimestamp()
  });

  document.getElementById("apptPerson").value = "";
  document.getElementById("apptDoctor").value = "";
  document.getElementById("apptLocation").value = "";
  document.getElementById("apptDriver").value = "";
  document.getElementById("apptDate").value = "";
  document.getElementById("apptTime").value = "";
  document.getElementById("apptNotes").value = "";

  await loadAppointments();
}

export async function loadAppointments() {
  const appointmentsDiv = document.getElementById("appointments");
  const todayDiv = document.getElementById("todayAppointments");

  appointmentsDiv.innerHTML = "";
  todayDiv.innerHTML = "";

  const snapshot = await getDocs(collection(db, "appointments"));
  const appointments = [];

  snapshot.forEach(doc => {
    appointments.push(doc.data());
  });

  appointments.sort((a, b) => {
    const dateA = `${a.date || ""} ${a.time || ""}`;
    const dateB = `${b.date || ""} ${b.time || ""}`;
    return dateA.localeCompare(dateB);
  });

  const today = new Date().toISOString().split("T")[0];

  const todaysAppointments = appointments.filter(a => a.date === today);

  if (todaysAppointments.length === 0) {
    todayDiv.innerHTML = "<p>No appointments today.</p>";
  } else {
    todaysAppointments.forEach(a => {
      todayDiv.innerHTML += renderAppointment(a, true);
    });
  }

  if (appointments.length === 0) {
    appointmentsDiv.innerHTML = "<p>No appointments added yet.</p>";
    return;
  }

  appointments.forEach(a => {
    appointmentsDiv.innerHTML += renderAppointment(a, false);
  });
}

function renderAppointment(a, compact) {
  return `
    <div class="item">
      <strong>${a.person}</strong>
      <p>${a.doctor}</p>
      <p>📅 ${a.date || ""} ${a.time || ""}</p>
      ${a.location ? `<p>📍 ${a.location}</p>` : ""}
      ${a.driver ? `<p>🚗 Driver: ${a.driver}</p>` : ""}
      ${a.notes && !compact ? `<p>📝 ${a.notes}</p>` : ""}
      <small>Added by ${a.createdBy || "unknown"}</small>
    </div>
  `;
}
