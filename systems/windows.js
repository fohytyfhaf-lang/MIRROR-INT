export function openApp(name) {
  document.getElementById(name + "Window").classList.remove("hidden");
}

export function closeApp(name) {
  document.getElementById(name + "Window").classList.add("hidden");
}
