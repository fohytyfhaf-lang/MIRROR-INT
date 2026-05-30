let musicStarted = false;
let audio;

export function initAudio() {
  audio = document.getElementById("music");
}

export function toggleMusic() {
  if (!audio) return;

  if (!musicStarted) {
    audio.play();
    musicStarted = true;
  } else {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
}
