const cams = [
  { src: "images/cam_secret.gif", anomaly: false },
  { src: "images/cam_lab.gif", anomaly: true },
  { src: "images/cam_glitch.gif", anomaly: true }
];

let i = 0;

export function initCamera() {
  updateCam();
}

export function nextCam() {
  i = (i + 1) % cams.length;
  updateCam();
}

function updateCam() {

  const cam = cams[i];
  const view = document.getElementById("camView");

  view.src = cam.src;

  if (cam.anomaly) {
    document.getElementById("chatLog").innerText +=
      "\n⚠ anomaly detected in " + cam.src;
  }
}
