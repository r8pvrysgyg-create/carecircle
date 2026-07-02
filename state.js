export const appState = {
  appointments: [],
  tasks: [],
  notes: []
};

export function formatDate(dateString) {
  if (!dateString) return "No date";
  const [year, month, day] = dateString.split("-");
  return `${month}/${day}/${year}`;
}

export function todayString() {
  return new Date().toISOString().split("T")[0];
}
