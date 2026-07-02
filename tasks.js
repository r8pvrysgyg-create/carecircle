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

export async function addTask() {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to add tasks.");
    return;
  }

  const title = document.getElementById("taskTitle").value.trim();
  const assignedTo = document.getElementById("taskAssignedTo").value.trim();
  const dueDate = document.getElementById("taskDueDate").value;
  const notes = document.getElementById("taskNotes").value.trim();

  if (!title) {
    alert("Please enter a task.");
    return;
  }

  await addDoc(collection(db, "tasks"), {
    title,
    assignedTo,
    dueDate,
    notes,
    completed: false,
    createdBy: user.email,
    createdAt: serverTimestamp()
  });

  clearTaskForm();
  await loadTasks();
}

export async function loadTasks() {
  const tasksDiv = document.getElementById("tasks");
  const openTasksDiv = document.getElementById("openTasks");

  tasksDiv.innerHTML = "";
  openTasksDiv.innerHTML = "";

  const snapshot = await getDocs(collection(db, "tasks"));
  const tasks = [];

  snapshot.forEach(taskDoc => {
    tasks.push({
      id: taskDoc.id,
      ...taskDoc.data()
    });
  });

  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.dueDate || "9999-99-99").localeCompare(b.dueDate || "9999-99-99");
  });

  const openTasks = tasks.filter(t => !t.completed);

  openTasksDiv.innerHTML = openTasks.length
    ? openTasks.slice(0, 5).map(task => renderTask(task, true)).join("")
    : "<p>No open tasks.</p>";

  tasksDiv.innerHTML = tasks.length
    ? tasks.map(task => renderTask(task, false)).join("")
    : "<p>No tasks yet.</p>";

  setupTaskButtons();
}

function renderTask(task, compact) {
  return `
    <div class="item task-item ${task.completed ? "completed" : ""}">
      <div class="task-row">
        <button
          class="check-btn"
          data-task-toggle="${task.id}"
          data-completed="${task.completed}"
          title="Toggle complete"
        >
          ${task.completed ? "☑" : "☐"}
        </button>

        <div>
          <strong>${task.title}</strong>
          ${task.assignedTo ? `<p>👤 Assigned: ${task.assignedTo}</p>` : ""}
          ${task.dueDate ? `<p>📅 Due: ${task.dueDate}</p>` : ""}
          ${task.notes && !compact ? `<p>📝 ${task.notes}</p>` : ""}
          <small>Added by ${task.createdBy || "unknown"}</small>

          ${!compact ? `
            <div class="action-row">
              <button class="danger" data-task-delete="${task.id}">Delete</button>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

function setupTaskButtons() {
  document.querySelectorAll("[data-task-toggle]").forEach(button => {
    button.onclick = async () => {
      const id = button.getAttribute("data-task-toggle");
      const completed = button.getAttribute("data-completed") === "true";

      await updateDoc(doc(db, "tasks", id), {
        completed: !completed,
        completedAt: !completed ? serverTimestamp() : null,
        completedBy: !completed ? auth.currentUser.email : null
      });

      await loadTasks();
    };
  });

  document.querySelectorAll("[data-task-delete]").forEach(button => {
    button.onclick = async () => {
      const id = button.getAttribute("data-task-delete");

      if (!confirm("Delete this task?")) return;

      await deleteDoc(doc(db, "tasks", id));
      await loadTasks();
    };
  });
}

function clearTaskForm() {
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskAssignedTo").value = "";
  document.getElementById("taskDueDate").value = "";
  document.getElementById("taskNotes").value = "";
}
