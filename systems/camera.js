const cams = [
  "images/cam_secret.gif",
  "images/cam_glitch.gif",
  "images/cam_lab.gif"
];

let i = 0;

export function initCamera() {
  document.getElementById("camView").src = cams[0];
}

export function nextCam() {
  i = (i + 1) % cams.length;
  document.getElementById("camView").src = cams[i];
}
