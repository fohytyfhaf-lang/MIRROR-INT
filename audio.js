const bgm = document.getElementById("bgm");

let currentTrack = null;

export function playMusic(file, volume = 0.4) {
  if (!bgm) return;

  const path = `./audio/${file}`;

  if (currentTrack === path) return;

  currentTrack = path;

  bgm.src = path;
  bgm.loop = true;
  bgm.volume = volume;

  bgm.play().catch(() => {});
}

export function stopMusic() {
  if (!bgm) return;

  bgm.pause();
  bgm.currentTime = 0;
  currentTrack = null;
}
