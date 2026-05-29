window.$ = (id) => document.getElementById(id);

window.show = (id) => {
  const el = $(id);
  if (el) el.style.display = "block";
};

window.hide = (id) => {
  const el = $(id);
  if (el) el.style.display = "none";
};

window.state = {
  logged: false,
  cameraIndex: 0,
  clockStarted: false,
  audioStarted: false
};
