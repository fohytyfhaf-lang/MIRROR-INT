const $ = (id) => document.getElementById(id);

function show(id) {

  const el = $(id);

  if (el)
    el.style.display = "block";
}

function hide(id) {

  const el = $(id);

  if (el)
    el.style.display = "none";
}

function openWindow(id) {

  const win = $(id);

  if (!win) return;

  win.style.display = "block";

  if (!win.dataset.init) {

    win.style.top = "120px";
    win.style.left = "120px";

    win.dataset.init = true;
  }
}

function closeWindow(id) {

  const win = $(id);

  if (!win) return;

  win.style.display = "none";
}
