function loginSystem() {

  const user = $("user").value;
  const pass = $("pass").value;

  if (user !== "operator" || pass !== "0404") {

    $("loginStatus").innerText =
      "ACCESS DENIED";

    return;
  }

  $("loginStatus").innerText =
    "ACCESS GRANTED";

  setTimeout(() => {

    document
      .getElementById("login")
      .classList.remove("active");

    show("screen");

    startClock();

  }, 500);
}
