
let cameraIndex = 0;

const cameras = [

{
name:"CAM SERVER",
src:"images/cam_server.gif"
},

{
name:"CAM STORAGE",
src:"images/cam_storage.gif"
},

{
name:"CAM LAB",
src:"images/cam_lab.gif"
},

{
name:"CAM OFFICE",
src:"images/cam_office.gif"
}

];

function switchCamera(dir){

cameraIndex += dir;

if(cameraIndex < 0)
cameraIndex = cameras.length - 1;

if(cameraIndex >= cameras.length)
cameraIndex = 0;

$("cam").src = cameras[cameraIndex].src;

$("cameraName").innerText =
cameras[cameraIndex].name;

}

