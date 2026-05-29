function loginSystem() {
  const user = $("user").value;
  const pass = $("pass").value;
  const status = $("loginStatus");

  const ok =
    (user === "operator" && pass === "0404") ||
    (user === "omega" && pass === "mirror") ||
    (user === "research" && pass === "void");

  if (!ok) {
    status.innerText = "ACCESS DENIED";
    return;
  }

  status.innerText = "ACCESS GRANTED";

  setTimeout(() => {
    $("login").classList.remove("active");
    show("screen");

    window.state.logged = true;

    startClock();
  }, 500);
}
