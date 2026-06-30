import { Storage } from "./storage.js";

/* =========================
        DEFAULT DATA
========================= */

const defaultPersonnel = [
  {
    id: 1,
    name: "UNKNOWN UNIT-01",
    role: "SYSTEM ENTITY",
    status: "ACTIVE",
    clearance: 5,
    notes: "No additional data available."
  },
  {
    id: 2,
    name: "DR. K",
    role: "RESEARCHER",
    status: "UNKNOWN",
    clearance: 4,
    notes: "Connected to anomaly research division."
  },
  {
    id: 3,
    name: "MR.SMILE CORE",
    role: "UNKNOWN ENTITY",
    status: "UNSTABLE",
    clearance: 9,
    notes: "Do not interact without authorization."
  }
];

/* =========================
        INIT STORAGE
========================= */

function initPersonnelData() {
  const data = Storage.get("personnel");

  if (!data) {
    Storage.set("personnel", defaultPersonnel);
  }
}

/* =========================
        RENDER LIST
========================= */

function renderPersonnel() {
  const list = document.getElementById("personnelList");
  if (!list) return;

  const data = Storage.get("personnel", []);

  list.innerHTML = "";

  data.forEach(person => {
    const card = document.createElement("div");
    card.className = "personCard";

    card.innerHTML = `
      <div class="personHeader">
        <h3>${person.name}</h3>
        <span class="badge">${person.status}</span>
      </div>

      <div class="personInfo">
        <p><b>ROLE:</b> ${person.role}</p>
        <p><b>CLEARANCE:</b> LVL ${person.clearance}</p>
      </div>
    `;

    card.addEventListener("click", () => openProfile(person.id));

    list.appendChild(card);
  });
}

/* =========================
        PROFILE VIEW
========================= */

function openProfile(id) {
  const data = Storage.get("personnel", []);
  const person = data.find(p => p.id === id);

  if (!person) return;

  const list = document.getElementById("personnelList");

  list.innerHTML = `
    <div class="personProfile">
      <button id="backBtn">⬅ BACK</button>

      <h2>${person.name}</h2>

      <div class="profileBlock">
        <p><b>ROLE:</b> ${person.role}</p>
        <p><b>STATUS:</b> ${person.status}</p>
        <p><b>CLEARANCE:</b> ${person.clearance}</p>
      </div>

      <div class="profileNotes">
        <p>${person.notes}</p>
      </div>
    </div>
  `;

  document.getElementById("backBtn").onclick = renderPersonnel;
}

/* =========================
        ADD PERSON (API)
========================= */

export function addPersonnel(person) {
  const data = Storage.get("personnel", []);

  data.push({
    id: Date.now(),
    ...person
  });

  Storage.set("personnel", data);
  renderPersonnel();
}

/* =========================
        INIT
========================= */

export function initPersonnel() {
  initPersonnelData();
  renderPersonnel();
}
