let cams = [
"images/cam_server.gif",
"images/cam_storage.gif",
"images/cam_lab.gif"
];

let i = 0;

function nextCam(){
  i++;
  if(i >= cams.length) i = 0;
  $("cam").src = cams[i];
}
