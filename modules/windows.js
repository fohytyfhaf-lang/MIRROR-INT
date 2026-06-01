export function openApp(name) {
  const w = document.getElementById(name + "Window");
  if (w) w.style.display = "block";
}

export function closeApp(name) {
  const w = document.getElementById(name + "Window");
  if (w) w.style.display = "none";
}
