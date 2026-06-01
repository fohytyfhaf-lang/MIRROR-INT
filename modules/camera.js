let i = 0;
const cams = ["1", "2", "3"];

export function nextCam() {
  i = (i + 1) % cams.length;
  console.log("CAM", cams[i]);
}
