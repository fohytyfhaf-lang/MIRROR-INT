let playing = false;

export function toggleMusic() {
  const music = document.getElementById("music");

  if (!playing) {
    music.play();
    playing = true;
  } else {
    music.pause();
    playing = false;
  }
}
