const bgm = document.getElementById("bgm");
let unlocked = false;
let currentTrack = null;

export function unlockAudio() {
  unlocked = true;
}

export function playMusic(file, volume = 0.5) {
  if (!bgm || !unlocked) return;

  const path = `./audio/${file}`;

  if (currentTrack === path) return;

  currentTrack = path;

  bgm.src = path;
  bgm.loop = true;
  bgm.volume = volume;

  bgm.play().catch(err => {
    console.log("Audio blocked:", err);
  });
}
