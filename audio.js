export function playMusic(name) {
  const bgm = document.getElementById("bgm");
  bgm.src = "audio/" + name;
  bgm.loop = true;
  bgm.play();
}
