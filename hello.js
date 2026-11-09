const STORAGE_KEY = "daymark-tasks";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const count = document.querySelector("#task-count");
const dateLabel = document.querySelector("#date-label");
const clearButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = loadTasks();
let activeFilter = "all";

dateLabel.textContent = new Intl.DateTimeFormat(undefined, {
	weekday: "long",
	month: "long",
	day: "numeric",
}).format(new Date());

function loadTasks() {
	try {
		const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
		return Array.isArray(savedTasks) ? savedTasks : [];
	} catch {
		return [];
	}
}

function saveTasks() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
	const visibleTasks = tasks.filter((task) => {
		if (activeFilter === "active") return !task.completed;
		if (activeFilter === "completed") return task.completed;
		return true;
	});
	const remaining = tasks.filter((task) => !task.completed).length;

	count.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;
	clearButton.hidden = !tasks.some((task) => task.completed);
	list.replaceChildren();

	if (visibleTasks.length === 0) {
		const empty = document.createElement("li");
		empty.className = "empty-state";
		empty.innerHTML = activeFilter === "completed"
			? '<md-icon class="empty-mark">task_alt</md-icon><span>Nothing completed yet.</span>'
			: '<md-icon class="empty-mark">checklist</md-icon><span>Your list is clear. Add a task to get moving.</span>';
		list.append(empty);
		return;
	}

	for (const task of visibleTasks) {
		const item = document.createElement("li");
		item.className = `task-row${task.completed ? " is-complete" : ""}`;

		const toggle = document.createElement("md-checkbox");
		toggle.className = "task-toggle";
		toggle.setAttribute("aria-label", task.completed ? `Mark ${task.text} as active` : `Complete ${task.text}`);
		if (task.completed) toggle.setAttribute("checked", "");
		toggle.addEventListener("click", () => {
			task.completed = !task.completed;
			saveTasks();
			renderTasks();
		});

		const label = document.createElement("span");
		label.className = "task-label";
		label.textContent = task.text;

		const remove = document.createElement("md-icon-button");
		remove.className = "task-remove";
		remove.setAttribute("aria-label", `Delete ${task.text}`);
		remove.title = `Delete ${task.text}`;
		const removeIcon = document.createElement("md-icon");
		removeIcon.textContent = "delete_outline";
		remove.append(removeIcon);
		remove.addEventListener("click", () => {
			tasks = tasks.filter((entry) => entry.id !== task.id);
			saveTasks();
			renderTasks();
		});

		item.append(toggle, label, remove);
		list.append(item);
	}
}

form.addEventListener("submit", (event) => {
	event.preventDefault();
	const text = input.value.trim();
	if (!text) return;

	tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
	input.value = "";
	activeFilter = "all";
	filterButtons.forEach((button) => {
		const selected = button.dataset.filter === activeFilter;
		button.classList.toggle("is-selected", selected);
		button.setAttribute("aria-pressed", String(selected));
		button.toggleAttribute("selected", selected);
	});
	saveTasks();
	renderTasks();
	input.focus();
});

filterButtons.forEach((button) => {
	button.addEventListener("click", () => {
		activeFilter = button.dataset.filter;
		filterButtons.forEach((filterButton) => {
			const selected = filterButton === button;
			filterButton.classList.toggle("is-selected", selected);
			filterButton.setAttribute("aria-pressed", String(selected));
			filterButton.toggleAttribute("selected", selected);
		});
		renderTasks();
	});
});

clearButton.addEventListener("click", () => {
	tasks = tasks.filter((task) => !task.completed);
	saveTasks();
	renderTasks();
});

renderTasks();
