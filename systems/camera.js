let cameraIndex = 0;

const cameras = [

  {
    name: "CAM SERVER",
    src: "images/cam_server.gif"
  },

  {
    name: "CAM LAB",
    src: "images/cam_lab.gif"
  }
];

function switchCamera(dir) {

  cameraIndex += dir;

  if (cameraIndex < 0)
    cameraIndex = cameras.length - 1;

  if (cameraIndex >= cameras.length)
    cameraIndex = 0;

  const cam = $("cam");

  const name = $("cameraName");

  cam.src = cameras[cameraIndex].src;

  name.innerText = cameras[cameraIndex].name;
}
