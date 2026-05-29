function startBoot(){

  const bar = $("bootProgress");
  const text = $("loadText");
  const status = $("bootStatus");

  const logs = [
    "Loading system...",
    "Checking memory...",
    "Injecting modules...",
    "SYSTEM READY"
  ];

  const boot = setInterval(() => {

    progress += 5;

    if(bar) bar.style.width = progress + "%";
    if(text) text.innerText = progress + "%";

    if(status){
      status.innerText =
        logs[Math.floor(progress / 25)] || "READY";
    }

    if(progress >= 100){

      clearInterval(boot);

      setTimeout(() => {

        const loading = $("loading");
        const login = $("login");

        if(loading) loading.style.display = "none";
        if(login) login.classList.add("active");

      }, 500);
    }

  }, 120);
}
