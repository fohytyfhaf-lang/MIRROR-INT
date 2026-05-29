let progress = 0;

function startIntro() {

  show("biosScreen");

  setTimeout(() => {

    hide("biosScreen");

    show("hackScreen");

    setTimeout(() => {

      hide("hackScreen");

      startBoot();

    }, 1200);

  }, 1200);
}

function startBoot() {

  show("loading");

  const bar = $("bootProgress");
  const text = $("loadText");

  const boot = setInterval(() => {

    progress += 5;

    if (bar)
      bar.style.width = progress + "%";

    if (text)
      text.innerText = progress + "%";

    if (progress >= 100) {

      clearInterval(boot);

      hide("loading");

      document
        .getElementById("login")
        .classList.add("active");
    }

  }, 120);
}
