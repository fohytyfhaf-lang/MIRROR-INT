import { Storage } from "./storage.js";

/* =========================
   RESEARCH DATABASE
========================= */

const researchData = [
  {
    name: "KITCH",
    type: "Entity",
    danger: 4,
    status: "Neutral",
    description: `
A living organism with tentacle-like needles containing toxin.
Not aggressive unless provoked.

Behavior:
- Calm when unprovoked
- Attacks when attacked
- High intelligence
    `
  },

  {
    name: "MICH",
    type: "Entity",
    danger: 5,
    status: "Hostile",
    description: `
Blind predator relying on extreme hearing.

Behavior:
- Attracts victims using sound mimicry
- Extremely aggressive when target approaches
- Cannot see, only hears
    `
  },

  {
    name: "GARDENER",
    type: "Entity",
    danger: 3,
    status: "Conditional",
    description: `
Non-hostile unless flowers are damaged.

Behavior:
- Passive if environment intact
- Becomes hostile if plants are destroyed
- Protects biological growth
    `
  },

  {
    name: "SURGEON",
    type: "Entity",
    danger: 6,
    status: "Dual-State",
    description: `
Two-headed immortal former soldier.

Behavior:
- Calm during daytime
- Night cycle triggers aggression
- Constant hunger state
- Extremely dangerous in combat
    `
  },

  {
    name: "TEN",
    type: "Entity",
    danger: 5,
    status: "Unknown",
    description: `
Unstable anomaly entity.

Behavior:
- Unknown patterns
- Possible reality distortion
- High aggression level
    `
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
