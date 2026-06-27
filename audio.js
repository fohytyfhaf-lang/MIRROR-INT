const bgm = document.getElementById("bgm");

let currentTrack = null;

export function playMusic(file, volume = 0.5) {
  if (!bgm) return;

  const path = `./audio/${file}`;

  // не перезапускаем ту же музыку
  if (currentTrack === path) return;

  currentTrack = path;

  bgm.src = path;
  bgm.loop = true;
  bgm.volume = volume;

  const playPromise = bgm.play();

  if (playPromise !== undefined) {
    playPromise.catch(err => {
      console.log("Audio blocked or failed:", err);
    });
  }
}

export function stopMusic() {
  if (!bgm) return;

  bgm.pause();
  bgm.currentTime = 0;
  currentTrack = null;
}

export function setVolume(v) {
  if (bgm) bgm.volume = v;
}
