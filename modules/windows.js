let topZ = 10;

/* =========================
   OPEN WINDOW
========================= */

export function openApp(name) {
  const win = document.getElementById(name + "Window");
  if (!win) return;

  win.classList.remove("hidden");
  bringToFront(win);
}

/* =========================
   CLOSE WINDOW
========================= */

export function closeApp(name) {
  const win = document.getElementById(name + "Window");
  if (!win) return;

  win.classList.add("hidden");
}

/* =========================
   WINDOW FOCUS SYSTEM
========================= */

function bringToFront(win) {
  topZ++;
  win.style.zIndex = topZ;
}

/* =========================
   DRAG SYSTEM (Windows-like)
========================= */

document.addEventListener("mousedown", (e) => {
  const title = e.target.closest(".title");
  if (!title) return;

  const win = title.parentElement;
  if (!win) return;

  bringToFront(win);

  const rect = win.getBoundingClientRect();

  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  function move(ev) {
    win.style.left = (ev.clientX - offsetX) + "px";
    win.style.top = (ev.clientY - offsetY) + "px";
  }

  function up() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
  }

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
});
