const taskForm = document.getElementById("task-form");
const taskNameInput = document.getElementById("task-name");
const tableBody = document.getElementById("task-table-body");
const selectedHelp = document.getElementById("selection-help");
const toast = document.getElementById("toast");

const buttons = {
  startAll: document.getElementById("start-all"),
  pause: document.getElementById("pause-selected"),
  resume: document.getElementById("resume-selected"),
  stop: document.getElementById("stop-selected"),
  clear: document.getElementById("clear-tasks")
};

const stats = {
  total: document.getElementById("total-count"),
  running: document.getElementById("running-count"),
  paused: document.getElementById("paused-count"),
  completed: document.getElementById("completed-count"),
  stopped: document.getElementById("stopped-count"),
  label: document.getElementById("task-total-label")
};

let tasks = [];
let nextTaskId = 1;
let selectedTaskId = null;
let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function findTask(id) {
  return tasks.find(task => task.id === id) || null;
}

function addTask(name) {
  const task = {
    id: nextTaskId++,
    name,
    status: "Pending",
    progress: 0,
    timerId: null
  };
  tasks.push(task);
  selectedTaskId = task.id;
  render();
  showToast(`"${name}" added to the task list.`);
}

function startTask(task) {
  if (!task || !["Pending"].includes(task.status)) return;
  task.status = "Running";
  task.timerId = window.setInterval(() => {
    if (task.status !== "Running") return;

    task.progress = Math.min(100, task.progress + 1);
    if (task.progress >= 100) {
      window.clearInterval(task.timerId);
      task.timerId = null;
      task.status = "Completed";
      showToast(`"${task.name}" completed.`);
    }
    render();
  }, 100);
  render();
}

function startAllTasks() {
  const pendingTasks = tasks.filter(task => task.status === "Pending");
  if (pendingTasks.length === 0) {
    showToast(tasks.length ? "There are no pending tasks to start." : "Add tasks first.");
    return;
  }
  pendingTasks.forEach(startTask);
  showToast(`${pendingTasks.length} task(s) started.`);
}

function pauseSelectedTask() {
  const task = findTask(selectedTaskId);
  if (!task || task.status !== "Running") return;
  window.clearInterval(task.timerId);
  task.timerId = null;
  task.status = "Paused";
  render();
  showToast(`"${task.name}" paused.`);
}

function resumeSelectedTask() {
  const task = findTask(selectedTaskId);
  if (!task || task.status !== "Paused") return;
  task.status = "Running";
  task.timerId = window.setInterval(() => {
    if (task.status !== "Running") return;
    task.progress = Math.min(100, task.progress + 1);
    if (task.progress >= 100) {
      window.clearInterval(task.timerId);
      task.timerId = null;
      task.status = "Completed";
      showToast(`"${task.name}" completed.`);
    }
    render();
  }, 100);
  render();
  showToast(`"${task.name}" resumed.`);
}

function stopSelectedTask() {
  const task = findTask(selectedTaskId);
  if (!task || !["Running", "Paused", "Pending"].includes(task.status)) return;
  if (task.timerId !== null) window.clearInterval(task.timerId);
  task.timerId = null;
  task.status = "Stopped";
  render();
  showToast(`"${task.name}" stopped.`);
}

function clearTasks() {
  const hasActiveTasks = tasks.some(task => task.status === "Running" || task.status === "Paused");
  if (hasActiveTasks) {
    showToast("Pause or stop active tasks before clearing the list.");
    return;
  }
  tasks = [];
  selectedTaskId = null;
  render();
  showToast("All tasks cleared.");
}

function updateStatistics() {
  const count = status => tasks.filter(task => task.status === status).length;
  stats.total.textContent = tasks.length;
  stats.running.textContent = count("Running");
  stats.paused.textContent = count("Paused");
  stats.completed.textContent = count("Completed");
  stats.stopped.textContent = count("Stopped");
  stats.label.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
}

function statusClass(status) {
  return `status-${status.toLowerCase()}`;
}

function render() {
  if (tasks.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">
          <div class="empty-state">
            <div class="empty-icon">☷</div>
            <strong>No tasks yet</strong>
            <span>Add a task above to get started.</span>
          </div>
        </td>
      </tr>`;
  } else {
    tableBody.innerHTML = tasks.map(task => `
      <tr class="task-row ${task.id === selectedTaskId ? "selected" : ""}"
          data-task-id="${task.id}" aria-selected="${task.id === selectedTaskId}">
        <td class="task-id">${task.id}</td>
        <td class="task-name">${escapeHTML(task.name)}</td>
        <td><span class="status ${statusClass(task.status)}">${task.status}</span></td>
        <td class="progress-cell">
          <div class="progress-line" role="progressbar" aria-valuenow="${task.progress}"
               aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHTML(task.name)} progress">
            <div class="progress-fill" style="width: ${task.progress}%"></div>
          </div>
          <div class="progress-meta"><span>${task.progress}%</span><span>${task.status === "Completed" ? "Done" : "Progress"}</span></div>
        </td>
        <td class="worker">${task.status === "Pending" ? "—" : `Worker-${task.id}`}</td>
      </tr>`).join("");
  }

  updateStatistics();
  updateControls();
}

function updateControls() {
  const task = findTask(selectedTaskId);
  const isRunning = task?.status === "Running";
  const isPaused = task?.status === "Paused";
  const canStop = task && ["Running", "Paused", "Pending"].includes(task.status);

  buttons.pause.disabled = !isRunning;
  buttons.resume.disabled = !isPaused;
  buttons.stop.disabled = !canStop;
  buttons.clear.disabled = tasks.length === 0;

  selectedHelp.textContent = task
    ? `Selected: ${task.name} · ${task.status}`
    : "Select a task row to control it.";
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = taskNameInput.value.trim();
  if (!name) {
    showToast("Please enter a task name.");
    taskNameInput.focus();
    return;
  }
  addTask(name);
  taskNameInput.value = "";
  taskNameInput.focus();
});

tableBody.addEventListener("click", event => {
  const row = event.target.closest("tr[data-task-id]");
  if (!row) return;
  selectedTaskId = Number(row.dataset.taskId);
  render();
});

buttons.startAll.addEventListener("click", startAllTasks);
buttons.pause.addEventListener("click", pauseSelectedTask);
buttons.resume.addEventListener("click", resumeSelectedTask);
buttons.stop.addEventListener("click", stopSelectedTask);
buttons.clear.addEventListener("click", clearTasks);

render();
