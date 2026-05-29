
let cameraIndex = 0;

const cameras = [
  {
    name: "CAM SERVER",
    src: "images/cam_server.gif"
  },

  {
    name: "CAM STORAGE",
    src: "images/cam_storage.gif"
  },

  {
    name: "CAM LAB",
    src: "images/cam_lab.gif"
  },

  {
    name: "CAM OFFICE",
    src: "images/cam_office.gif"
  },

  {
    name: "CAM HALL",
    src: "images/cam_hall.gif"
  },

  {
    name: "CAM SECRET",
    src: "images/cam_secret.gif"
  }
];

// preload GIF
cameras.forEach(cam => {

  const img = new Image();

  img.src = cam.src;
});

function switchCamera(dir) {

  cameraIndex += dir;

  if (cameraIndex < 0)
    cameraIndex = cameras.length - 1;

  if (cameraIndex >= cameras.length)
    cameraIndex = 0;

  const cam =
    document.getElementById("cam");

  const name =
    document.getElementById("cameraName");

  if (cam)
    cam.src = cameras[cameraIndex].src;

  if (name)
    name.innerText = cameras[cameraIndex].name;
}
```

