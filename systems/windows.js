function openWindow(id) {

  const win = document.getElementById(id);

  if (!win) return;

  win.style.display = "block";
}

function closeWindow(id) {

  const win = document.getElementById(id);

  if (!win) return;

  win.style.display = "none";
}
