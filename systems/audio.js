let audioStarted = false;

function startAudioOnce() {

  if (audioStarted) return;

  audioStarted = true;

  const bg = $("bgMusic");

  if (bg)
    bg.play().catch(() => {});
}

function initAudio() {

  document.addEventListener(
    "pointerdown",
    startAudioOnce,
    { once: true }
  );
}
