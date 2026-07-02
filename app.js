import { setupAuth } from "./auth.js";
import { addNote, loadNotes } from "./notes.js";
import { addAppointment, loadAppointments } from "./appointments.js";
import { addTask, loadTasks } from "./tasks.js";

document.getElementById("addNote").onclick = addNote;
document.getElementById("addAppt").onclick = addAppointment;
document.getElementById("addTask").onclick = addTask;
 
setupAuth(
  async () => {
    await loadNotes();
    await loadAppointments();
    await loadTasks();
  },
  () => {
    document.getElementById("notes").innerHTML = "";
    document.getElementById("recentNotes").innerHTML = "";
    document.getElementById("appointments").innerHTML = "";
    document.getElementById("todayAppointments").innerHTML = "";
    document.getElementById("tasks").innerHTML = "";
    document.getElementById("openTasks").innerHTML = "";
  }
);
