export function initMrSmileEyes() {

    const eyes = document.querySelectorAll(".mrEye");

    if (!eyes.length)
        return;

    document.addEventListener("mousemove", (event) => {

        eyes.forEach(eye => {

            const pupil =
                eye.querySelector(".mrPupil");

            if (!pupil)
                return;

            const rect =
                eye.getBoundingClientRect();

            const centerX =
                rect.left + rect.width / 2;

            const centerY =
                rect.top + rect.height / 2;

            const dx =
                event.clientX - centerX;

            const dy =
                event.clientY - centerY;

            const angle =
                Math.atan2(dy, dx);

            const distance =
                Math.min(
                    5,
                    Math.hypot(dx, dy) / 120
                );

            const x =
                Math.cos(angle) * distance;

            const y =
                Math.sin(angle) * distance;

            pupil.style.transform =
                `translate(
                    calc(-50% + ${x}px),
                    calc(-50% + ${y}px)
                )`;

        });

    });

}
