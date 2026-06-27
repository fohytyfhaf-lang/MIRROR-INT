let bgm = null;

/* =========================
   INIT AUDIO SYSTEM
========================= */

function initAudio() {
  bgm = document.getElementById("bgm");

  if (!bgm) {
    console.warn("AUDIO ELEMENT NOT FOUND (#bgm)");
    return;
  }

  bgm.loop = true;
  bgm.volume = 0.5;
}

/* =========================
   PLAY MUSIC SAFE
========================= */

export function playMusic(file) {
  if (!bgm) initAudio();
  if (!bgm) return;

  bgm.src = "audio/" + file;

  const playPromise = bgm.play();

  if (playPromise !== undefined) {
    playPromise.catch(err => {
      console.warn("AUDIO BLOCKED BY BROWSER:", err);
    });
  }
}

/* =========================
   STOP MUSIC (optional)
========================= */

export function stopMusic() {
  if (!bgm) return;
  bgm.pause();
  bgm.currentTime = 0;
}
