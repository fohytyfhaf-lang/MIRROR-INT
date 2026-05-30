let audio;

export function initAudio() {
  audio = document.getElementById("music");
}

export function toggleMusic() {
  if (!audio) return;

  if (audio.paused) audio.play();
  else audio.pause();
}
