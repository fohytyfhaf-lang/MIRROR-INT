export function openApp(name) {
  const w = document.getElementById(name + "Window");
  if (w) w.classList.remove("hidden");
}

export function closeApp(name) {
  const w = document.getElementById(name + "Window");
  if (w) w.classList.add("hidden");
}
