import { setupAuth } from "./auth.js";
import { addNote, loadNotes } from "./notes.js";
import { addAppointment, loadAppointments } from "./appointments.js";

document.getElementById("addNote").onclick = addNote;
document.getElementById("addAppt").onclick = addAppointment;

setupAuth(
  async () => {
    await loadNotes();
    await loadAppointments();
  },
  () => {
    document.getElementById("notes").innerHTML = "";
    document.getElementById("recentNotes").innerHTML = "";
    document.getElementById("appointments").innerHTML = "";
    document.getElementById("todayAppointments").innerHTML = "";
  }
);
