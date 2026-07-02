import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
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
    alert("Please enter person, doctor/visit type, and date.");
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
    status: "Scheduled",
    createdBy: user.email,
    createdAt: serverTimestamp()
  });

  clearAppointmentForm();
  await loadAppointments();
}

export async function loadAppointments() {
  const appointmentsDiv = document.getElementById("appointments");
  const todayDiv = document.getElementById("todayAppointments");

  appointmentsDiv.innerHTML = "";
  todayDiv.innerHTML = "";

  const snapshot = await getDocs(collection(db, "appointments"));
  const appointments = [];

  snapshot.forEach(docSnap => {
    appointments.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  appointments.sort((a, b) => {
    return `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`);
  });

  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(a => a.date === today);

  todayDiv.innerHTML = todaysAppointments.length
    ? todaysAppointments.map(a => renderAppointment(a, true)).join("")
    : "<p>No appointments today.</p>";

  appointmentsDiv.innerHTML = appointments.length
    ? appointments.map(a => renderAppointment(a, false)).join("")
    : "<p>No appointments added yet.</p>";

  setupAppointmentButtons();
}

function renderAppointment(a, compact) {
  return `
    <div class="item">
      <strong>${a.person}</strong>
      <p>${a.doctor}</p>
      <p>📅 ${a.date || ""} ${a.time || ""}</p>
      <p>Status: <strong>${a.status || "Scheduled"}</strong></p>
      ${a.location ? `<p>📍 ${a.location}</p>` : ""}
      ${a.driver ? `<p>🚗 Driver: ${a.driver}</p>` : ""}
      ${a.notes && !compact ? `<p>📝 ${a.notes}</p>` : ""}
      <small>Added by ${a.createdBy || "unknown"}</small>

      ${!compact ? `
        <div class="action-row">
          <button data-appt-status="${a.id}" data-current-status="${a.status || "Scheduled"}">Change Status</button>
          <button class="danger" data-appt-delete="${a.id}">Delete</button>
        </div>
      ` : ""}
    </div>
  `;
}

function setupAppointmentButtons() {
  document.querySelectorAll("[data-appt-delete]").forEach(button => {
    button.onclick = async () => {
      const id = button.getAttribute("data-appt-delete");

      if (!confirm("Delete this appointment?")) return;

      await deleteDoc(doc(db, "appointments", id));
      await loadAppointments();
    };
  });

  document.querySelectorAll("[data-appt-status]").forEach(button => {
    button.onclick = async () => {
      const id = button.getAttribute("data-appt-status");
      const current = button.getAttribute("data-current-status");

      const statuses = ["Scheduled", "Confirmed", "Completed", "Cancelled"];
      const currentIndex = statuses.indexOf(current);
      const nextStatus = statuses[(currentIndex + 1) % statuses.length];

      await updateDoc(doc(db, "appointments", id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });

      await loadAppointments();
    };
  });
}

function clearAppointmentForm() {
  document.getElementById("apptPerson").value = "";
  document.getElementById("apptDoctor").value = "";
  document.getElementById("apptLocation").value = "";
  document.getElementById("apptDriver").value = "";
  document.getElementById("apptDate").value = "";
  document.getElementById("apptTime").value = "";
  document.getElementById("apptNotes").value = "";
}
