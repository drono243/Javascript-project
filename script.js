const STORAGE_KEY = "readLaterItems";

const AGE_THRESHOLD_YELLOW = 4;
const AGE_THRESHOLD_RED = 15;

let bookmarks = [];
let activeFilter = "all";

const addForm = document.getElementById("addForm");
const titleInput = document.getElementById("titleInput");
const typeInput = document.getElementById("typeInput");
const urlInput = document.getElementById("urlInput");

const unreadListEl = document.getElementById("unreadList");
const archiveListEl = document.getElementById("archiveList");
const archiveToggle = document.getElementById("archiveToggle");
const archiveCountEl = document.getElementById("archiveCount");
const filterGroup = document.getElementById("filterGroup");

const totalDebtValueEl = document.getElementById("totalDebtValue");
const statCountEl = document.getElementById("statCount");
const statTotalDebtEl = document.getElementById("statTotalDebt");
const statAverageEl = document.getElementById("statAverage");
const statOldestEl = document.getElementById("statOldest");
const statementDateEl = document.getElementById("statementDate");

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  bookmarks = raw ? JSON.parse(raw) : [];
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

function calculateAge(dateAdded) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((Date.now() - dateAdded) / msPerDay);
}

function getAgeClass(days) {
  if (days >= AGE_THRESHOLD_RED) return "age-red";
  if (days >= AGE_THRESHOLD_YELLOW) return "age-yellow";
  return "age-green";
}

function handleAddSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) return;

  const now = Date.now();

  const newBookmark = {
    id: now,
    title: title,
    type: typeInput.value,
    url: urlInput.value.trim(),
    dateAdded: now,
    status: "unread",
  };

  bookmarks.push(newBookmark);
  saveToStorage();
  render();

  addForm.reset();
  titleInput.focus();
}

function deleteItem(id) {
  bookmarks = bookmarks.filter((item) => item.id !== id);
  saveToStorage();
  render();
}

function updateStatus(id, newStatus) {
  const item = bookmarks.find((item) => item.id === id);
  if (item) {
    item.status = newStatus;
    saveToStorage();
    render();
  }
}

function calculateStats(unreadItems) {
  const count = unreadItems.length;

  const totalDebt = unreadItems.reduce((sum, item) => {
    return sum + calculateAge(item.dateAdded);
  }, 0);

  const average = count > 0 ? Math.round(totalDebt / count) : 0;

  const oldest = count > 0
    ? [...unreadItems].sort((a, b) => a.dateAdded - b.dateAdded)[0]
    : null;

  return { count, totalDebt, average, oldest };
}

function renderStats(stats) {
  statCountEl.textContent = stats.count;
  statTotalDebtEl.textContent = `${stats.totalDebt} days`;
  statAverageEl.textContent = `${stats.average} days`;
  statOldestEl.textContent = stats.oldest
    ? `${stats.oldest.title} (${calculateAge(stats.oldest.dateAdded)}d)`
    : "—";

  totalDebtValueEl.textContent = `${stats.totalDebt} days`;
}

function buildCardHTML(item, options) {
  const isArchived = options && options.archived;
  const days = calculateAge(item.dateAdded);
  const ageClass = getAgeClass(days);

  const linkHTML = item.url
    ? `<a class="item-link" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.url}</a>`
    : "";

  const rightBadgeHTML = isArchived
    ? `<span class="item-status-tag">${item.status}</span>`
    : `<span class="item-age ${ageClass}">${days}d old</span>`;

  const actionsHTML = isArchived
    ? `<button type="button" class="action-delete" data-action="delete" data-id="${item.id}">Delete</button>`
    : `
      <button type="button" data-action="read" data-id="${item.id}">Mark Read</button>
      <button type="button" data-action="abandon" data-id="${item.id}">Abandon</button>
      <button type="button" class="action-delete" data-action="delete" data-id="${item.id}">Delete</button>
    `;

  return `
    <li class="item-card ${isArchived ? "" : ageClass}" data-id="${item.id}">
      <div class="item-main">
        <span class="item-title">${escapeHTML(item.title)}</span>
        <span class="item-type">${item.type}</span>
        <span class="item-dots"></span>
        ${rightBadgeHTML}
      </div>
      <div class="item-actions">${actionsHTML}</div>
      ${linkHTML}
    </li>
  `;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderList() {
  const unreadItems = bookmarks.filter((item) => item.status === "unread");

  const visibleItems = activeFilter === "all"
    ? unreadItems
    : unreadItems.filter((item) => item.type === activeFilter);

  const sortedItems = [...visibleItems].sort((a, b) => a.dateAdded - b.dateAdded);

  unreadListEl.innerHTML = sortedItems.map((item) => buildCardHTML(item)).join("");

  return unreadItems;
}

function renderArchive() {
  const archivedItems = bookmarks.filter(
    (item) => item.status === "read" || item.status === "abandoned"
  );

  archiveListEl.innerHTML = archivedItems
    .map((item) => buildCardHTML(item, { archived: true }))
    .join("");

  archiveCountEl.textContent = `(${archivedItems.length})`;
}

function render() {
  const unreadItems = renderList();
  renderArchive();
  renderStats(calculateStats(unreadItems));
}

addForm.addEventListener("submit", handleAddSubmit);

unreadListEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "delete") deleteItem(id);
  if (action === "read") updateStatus(id, "read");
  if (action === "abandon") updateStatus(id, "abandoned");
});

archiveListEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  if (button.dataset.action === "delete") deleteItem(Number(button.dataset.id));
});

archiveToggle.addEventListener("click", () => {
  const isExpanded = archiveToggle.getAttribute("aria-expanded") === "true";
  archiveToggle.setAttribute("aria-expanded", String(!isExpanded));
  archiveListEl.hidden = isExpanded;
});

filterGroup.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) return;

  activeFilter = button.dataset.type;

  filterGroup.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn === button);
  });

  render();
});

function init() {
  loadFromStorage();
  render();

  statementDateEl.textContent = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

init();
