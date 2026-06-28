export function initMrSmileEvents() {

    console.log("[MR.SMILE EVENTS] initialized");

    startNightEvents();
    startGlitchEvents();

}
function startNightEvents() {

    setInterval(() => {

        const h = new Date().getHours();
        const isNight = h >= 22 || h <= 5;

        const log = document.getElementById("chatLog");
        if (!log) return;

        if (isNight && Math.random() < 0.15) {

            log.innerText += "\n[SYSTEM] unauthorized presence detected";

        }

    }, 20000);

}
function startGlitchEvents() {

    setInterval(() => {

        const log = document.getElementById("chatLog");
        if (!log) return;

        if (Math.random() < 0.08) {

            const glitches = [
                "[SYSTEM] signal unstable",
                "[OMEGA] interference detected",
                "[MR.SMILE] ...",
                "..."
            ];

            log.innerText += "\n" + glitches[Math.floor(Math.random() * glitches.length)];

        }

    }, 30000);

}

