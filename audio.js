
const bgm = document.getElementById("bgm");

let currentTrack = null;
let fadeTimer = null;


/* =========================================================
   CLAMP VOLUME
========================================================= */

function clampVolume(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            1,
            number
        )
    );
}


/* =========================================================
   GET AUDIO VOLUME
========================================================= */

function getAudioVolume(
    settings,
    baseVolume
) {

    const master =
        Number(
            settings?.masterVolume ?? 70
        ) / 100;

    const music =
        Number(
            settings?.musicVolume ?? 70
        ) / 100;

    return clampVolume(
        baseVolume *
        master *
        music
    );
}


/* =========================================================
   PLAY MUSIC
========================================================= */

export function playMusic(
    file,
    volume = 0.4,
    settings = null
) {

    if (!bgm) {
        console.warn(
            "[AUDIO] #bgm not found"
        );

        return;
    }


    const finalVolume =
        getAudioVolume(
            settings,
            volume
        );


    const path =
        `./audio/${file}`;


    /* -----------------------------------------
       SAME TRACK
    ----------------------------------------- */

    if (currentTrack === path) {

        bgm.volume =
            finalVolume;

        return;
    }


    currentTrack =
        path;


    clearInterval(
        fadeTimer
    );


    /* =========================================
       FIRST TRACK
    ========================================= */

    if (!bgm.src) {

        bgm.src =
            path;

        bgm.loop =
            true;

        bgm.volume =
            0;


        const playPromise =
            bgm.play();


        if (playPromise) {

            playPromise.catch(
                (error) => {

                    console.warn(
                        "[AUDIO] Playback blocked:",
                        error
                    );

                }
            );
        }


        fadeTimer =
            setInterval(
                () => {

                    const nextVolume =
                        clampVolume(
                            bgm.volume + 0.03
                        );


                    bgm.volume =
                        nextVolume;


                    if (
                        nextVolume >=
                        finalVolume
                    ) {

                        bgm.volume =
                            finalVolume;


                        clearInterval(
                            fadeTimer
                        );
                    }

                },
                50
            );


        return;
    }


    /* =========================================
       FADE OUT OLD TRACK
    ========================================= */

    fadeTimer =
        setInterval(
            () => {

                const nextVolume =
                    clampVolume(
                        bgm.volume - 0.05
                    );


                bgm.volume =
                    nextVolume;


                if (
                    nextVolume <= 0.01
                ) {

                    clearInterval(
                        fadeTimer
                    );


                    bgm.volume =
                        0;


                    bgm.pause();

                    bgm.currentTime =
                        0;


                    /* =====================================
                       NEW TRACK
                    ===================================== */

                    bgm.src =
                        path;

                    bgm.loop =
                        true;

                    bgm.volume =
                        0;


                    const playPromise =
                        bgm.play();


                    if (playPromise) {

                        playPromise.catch(
                            (error) => {

                                console.warn(
                                    "[AUDIO] Playback blocked:",
                                    error
                                );

                            }
                        );
                    }


                    /* =====================================
                       FADE IN
                    ===================================== */

                    fadeTimer =
                        setInterval(
                            () => {

                                const next =
                                    clampVolume(
                                        bgm.volume + 0.03
                                    );


                                bgm.volume =
                                    next;


                                if (
                                    next >=
                                    finalVolume
                                ) {

                                    bgm.volume =
                                        finalVolume;


                                    clearInterval(
                                        fadeTimer
                                    );
                                }

                            },
                            50
                        );
                }

            },
            50
        );
}


/* =========================================================
   STOP MUSIC
========================================================= */

export function stopMusic() {

    if (!bgm) {
        return;
    }


    clearInterval(
        fadeTimer
    );


    fadeTimer =
        setInterval(
            () => {

                const nextVolume =
                    clampVolume(
                        bgm.volume - 0.05
                    );


                bgm.volume =
                    nextVolume;


                if (
                    nextVolume <= 0.01
                ) {

                    clearInterval(
                        fadeTimer
                    );


                    bgm.volume =
                        0;


                    bgm.pause();

                    bgm.currentTime =
                        0;


                    currentTrack =
                        null;
                }

            },
            50
        );
}


/* =========================================================
   UPDATE AUDIO SETTINGS
========================================================= */

export function updateAudioSettings(
    settings
) {

    if (!bgm) {
        return;
    }


    const finalVolume =
        getAudioVolume(
            settings,
            0.4
        );


    bgm.volume =
        finalVolume;
}
