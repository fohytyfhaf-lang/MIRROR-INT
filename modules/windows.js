let zIndex = 10;

export function openApp(name) {
  const win = document.getElementById(name + "Window");
  if (!win) return;

  win.classList.remove("hidden");
  bringToFront(win);
}

export function closeApp(name) {
  const win = document.getElementById(name + "Window");
  if (!win) return;

  win.classList.add("hidden");
}

export function bringToFront(win) {
  win.style.zIndex = ++zIndex;
}

document.addEventListener("mousedown", (e) => {
  const win = e.target.closest(".window");
  if (win) bringToFront(win);
});
