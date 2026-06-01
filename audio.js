const bgm = document.getElementById("bgm");

export function playMusic(file, volume = 0.5) {
  if (!bgm) return;

  if (bgm.src.includes(file)) return;

  bgm.src = "audio/" + file;
  bgm.volume = 0;
  bgm.loop = true;

  bgm.play().catch(() => {});

  let v = 0;
  const fade = setInterval(() => {
    if (v < volume) {
      v += 0.02;
      bgm.volume = v;
    } else {
      clearInterval(fade);
    }
  }, 30);
}
