let tasks = [];

function addTask() {
  const input = document.getElementById("task-input");
  const dateInput = document.getElementById("due-date");
  const taskText = input.value.trim();
  const dueDate = dateInput.value;

  if (taskText === "") return;

  const task = {
    id: Date.now(),
    text: taskText,
    due: dueDate,
    completed: false
  };

  tasks.push(task);
  input.value = "";
  dateInput.value = "";
  saveTasks();
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  let filteredTasks = [...tasks];
  const filter = document.getElementById("filter").value;
  const sortMode = document.getElementById("sortMode").value;

  if (filter === "active") filteredTasks = filteredTasks.filter(t => !t.completed);
  else if (filter === "completed") filteredTasks = filteredTasks.filter(t => t.completed);

  if (sortMode === "due") {
    filteredTasks.sort((a, b) => new Date(a.due || 0) - new Date(b.due || 0));
  }

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    const span = document.createElement("span");
    span.innerHTML = task.text + (task.due ? ` <small>(${task.due})</small>` : "");

    const doneBtn = document.createElement("button");
    doneBtn.innerHTML = "✅";
    doneBtn.onclick = () => toggleComplete(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "❌";
    deleteBtn.onclick = () => deleteTask(task.id);

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏️";
    editBtn.onclick = () => editTask(task.id);

    li.appendChild(span);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);
    li.appendChild(editBtn);
    li.setAttribute("data-id", task.id);
    list.appendChild(li);
  });

  updateCounter();

  if (document.getElementById("sortMode").value === "manual") {
    new Sortable(list, {
      animation: 150,
      onEnd: () => {
        const ids = [...list.children].map(li => parseInt(li.dataset.id));
        tasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
        saveTasks();
      }
    });
  }
}

function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();

  if (tasks.find(t => t.id === id).completed) {
    const audio = document.getElementById("checkSound");
    audio.play();
    confetti();
  }
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newText = prompt("Edit task:", task.text);
  if (newText !== null && newText.trim() !== "") {
    task.text = newText;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function clearAllTasks() {
  if (confirm("Delete all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
}

function updateCounter() {
  const counter = document.getElementById("task-counter");
  const remaining = tasks.filter(t => !t.completed).length;
  counter.textContent = `${remaining} task${remaining !== 1 ? "s" : ""}`;
}

function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const stored = localStorage.getItem("todoTasks");
  if (stored) {
    tasks = JSON.parse(stored);
  }
  renderTasks();
}

function toggleTheme() {
  const body = document.body;
  const themeBtn = document.getElementById("themeBtn");
  body.classList.toggle("light-theme");

  if (body.classList.contains("light-theme")) {
    themeBtn.innerText = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    themeBtn.innerText = "🌙";
    localStorage.setItem("theme", "dark");
  }
}

window.onload = () => {
  loadTasks();
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    document.getElementById("themeBtn").innerText = "☀️";
  }
};
