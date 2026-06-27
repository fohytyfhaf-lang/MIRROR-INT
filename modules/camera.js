let currentCam = 0;

const cameras = [
  "CAM 01 - HALL",
  "CAM 02 - SERVER ROOM",
  "CAM 03 - OUTSIDE",
  "CAM 04 - UNKNOWN SIGNAL"
];

/* =========================
   INIT CAMERA
========================= */

export function initCamera() {
  const view = document.getElementById("cameraView");
  if (view) {
    view.textContent = cameras[currentCam];
  }
}

/* =========================
   NEXT CAMERA
========================= */

export function nextCam() {
  currentCam++;

  if (currentCam >= cameras.length) {
    currentCam = 0;
  }

  const view = document.getElementById("cameraView");
  if (view) {
    view.textContent = cameras[currentCam];
  }

  // ARG effect (small glitch chance)
  if (Math.random() < 0.15) {
    triggerGlitch();
  }
}

/* =========================
   GLITCH EFFECT (ARG STYLE)
========================= */

function triggerGlitch() {
  const view = document.getElementById("cameraView");
  if (!view) return;

  const old = view.textContent;

  view.textContent = "SIGNAL LOST...";

  setTimeout(() => {
    view.textContent = old;
  }, 600);
}
