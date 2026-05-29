const cameras = [
  { name:"CAM SERVER", src:"images/cam_server.gif" },
  { name:"CAM STORAGE", src:"images/cam_storage.gif" },
  { name:"CAM LAB", src:"images/cam_lab.gif" },
  { name:"CAM OFFICE", src:"images/cam_office.gif" },
  { name:"CAM SECRET", src:"images/cam_secret.gif" },
  { name:"CAM GLITCH", src:"images/cam_glitch.gif" }
];

function switchCamera(dir){
  window.state.cameraIndex += dir;

  if (window.state.cameraIndex < 0)
    window.state.cameraIndex = cameras.length - 1;

  if (window.state.cameraIndex >= cameras.length)
    window.state.cameraIndex = 0;

  $("cam").src = cameras[window.state.cameraIndex].src;
  $("cameraName").innerText = cameras[window.state.cameraIndex].name;
}
