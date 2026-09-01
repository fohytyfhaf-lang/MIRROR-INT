const bgm = document.getElementById("bgm");

let currentTrack = null;
let fadeTimer = null;

export function playMusic(file, volume = 0.4) {

    if (!bgm) return;

        const settings = getSettings();

    const master =
        Number(settings.masterVolume ?? 70) / 100;

    const music =
        Number(settings.musicVolume ?? 70) / 100;

    const finalVolume =
        volume * master * music;

    const path = `./audio/${file}`;

    if (currentTrack === path) return;

    currentTrack = path;

    clearInterval(fadeTimer);

    const oldVolume = bgm.volume;

    /* =========================================
       FADE OUT
    ========================================= */

    fadeTimer = setInterval(() => {

        bgm.volume -= 0.05;

        if (bgm.volume <= 0.01) {

            clearInterval(fadeTimer);

            bgm.pause();
            bgm.currentTime = 0;

            /* =========================================
               NEW TRACK
            ========================================= */

            bgm.src = path;
            bgm.loop = true;
            bgm.volume = 0;

            bgm.play().catch(() => {});


            /* =========================================
               FADE IN
            ========================================= */

            fadeTimer = setInterval(() => {

                bgm.volume += 0.03;

                if (bgm.volume >= finalVolume) {

                    bgm.volume = finalVolume;

                    clearInterval(fadeTimer);

                 }

              

            }, 50);

        }

    }, 50);

}


export function stopMusic() {

    if (!bgm) return;

    clearInterval(fadeTimer);

    fadeTimer = setInterval(() => {

        bgm.volume -= 0.05;

        if (bgm.volume <= 0.01) {

            clearInterval(fadeTimer);

            bgm.pause();
            bgm.currentTime = 0;

            currentTrack = null;

        }

    }, 50);

}
