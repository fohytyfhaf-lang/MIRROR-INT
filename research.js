import { Storage } from "./storage.js";

/* =========================
   RESEARCH DATABASE
========================= */

const defaultResearch = [
  {
    id: "R-001",
    title: "UNKNOWN ENTITY SIGNALS",
    status: "ACTIVE",
    level: 3,
    description: "Detected unstable signal patterns across restricted network zones.",
  },
  {
    id: "R-002",
    title: "MR.SMILE BEHAVIOR LOG",
    status: "CLASSIFIED",
    level: 5,
    description: "Entity demonstrates adaptive awareness and UI manipulation.",
  },
  {
    id: "R-003",
    title: "SYSTEM ANOMALY INDEX",
    status: "MONITORING",
    level: 2,
    description: "Minor glitches detected in UI rendering and audio sync.",
  }
];

/* =========================
   INIT
========================= */

export function initResearch() {
  const list = document.getElementById("researchList");
  if (!list) return;

  const data = Storage.get("research", defaultResearch);

  Storage.set("research", data);

  render(data);
}

/* =========================
   RENDER
========================= */

function render(data) {
  const list = document.getElementById("researchList");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(item => {
    const el = document.createElement("div");
    el.className = "researchItem";

    el.innerHTML = `
      <div class="researchHeader">
        <span class="researchId">${item.id}</span>
        <span class="researchStatus">${item.status}</span>
      </div>

      <div class="researchTitle">${item.title}</div>

      <div class="researchDesc">${item.description}</div>

      <div class="researchLevel">LEVEL: ${item.level}</div>
    `;

    list.appendChild(el);
  });
}

/* =========================
   ADD ENTRY (for MR.SMILE later)
========================= */

export function addResearch(entry) {
  const data = Storage.get("research", defaultResearch);

  data.unshift(entry);

  Storage.set("research", data);

  render(data);
}
