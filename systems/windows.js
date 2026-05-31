function openWindow(id){
  show(id);
}
const $ = (id) => document.getElementById(id);

export function openApp(name) {
  const win = $(name + "Window");
  if (!win) return;
  win.classList.remove("hidden");
}

export function closeApp(name) {
  const win = $(name + "Window");
  if (!win) return;
  win.classList.add("hidden");
}
