export function loginSystem() {

  const u = $("user").value;
  const p = $("pass").value;

  const login = $("login");
  const screen = $("screen");

  if (u === "operator" && p === "0404") {

    $("loginStatus").innerText = "ACCESS GRANTED";

    setTimeout(() => {
      login.classList.add("hidden");
      screen.classList.remove("hidden");
    }, 300);

  } else {
    $("loginStatus").innerText = "ACCESS DENIED";
  }
}
