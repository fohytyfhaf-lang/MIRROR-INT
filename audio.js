const bgm = document.getElementById("bgm");

export function playMusic(file) {
  if (!bgm) return;

  bgm.src = "audio/" + file;
  bgm.loop = true;
  bgm.play().catch(() => {});
}
