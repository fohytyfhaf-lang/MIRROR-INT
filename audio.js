const bgm = document.getElementById("bgm");

let currentTrack = null;
let fadeTimer = null;


/* =========================================================
   GET AUDIO VOLUME
========================================================= */

function getAudioVolume(settings, baseVolume) {

    const master =
        Number(settings?.masterVolume ?? 70) / 100;

    const music =
        Number(settings?.musicVolume ?? 70) / 100;

    return Math.max(
        0,
        Math.min(
            1,
            baseVolume * master * music
        )
    );

}


/* =========================================================
   PLAY MUSIC
========================================================= */

export function playMusic(file, volume = 0.4, settings = null) {

    if (!bgm) return;


    const finalVolume =
        getAudioVolume(
            settings,
            volume
        );


    const path =
        `./audio/${file}`;


    if (currentTrack === path) {

        bgm.volume = finalVolume;

        return;

    }


    currentTrack = path;


    clearInterval(fadeTimer);


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


/* =========================================================
   STOP MUSIC
========================================================= */

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


/* =========================================================
   UPDATE AUDIO SETTINGS
========================================================= */

export function updateAudioSettings(settings) {

    if (!bgm) return;


    /*
       Если музыка сейчас играет,
       сохраняем её текущую базовую громкость
       через отношение текущей громкости к настройкам.
    */

    const master =
        Number(settings?.masterVolume ?? 70) / 100;

    const music =
        Number(settings?.musicVolume ?? 70) / 100;


    /*
       Основной базовый уровень.
       Для уже играющей музыки используем 0.4,
       как стандартный уровень системы.
    */

    const baseVolume = 0.4;


    const finalVolume =
        baseVolume *
        master *
        music;


    bgm.volume =
        Math.max(
            0,
            Math.min(
                1,
                finalVolume
            )
        );

}
