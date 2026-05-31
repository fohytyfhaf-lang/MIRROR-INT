export function initLogin() {}

export function loginSystem() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  const status = document.getElementById("loginStatus");

  if (u === "operator" && p === "0404") {

    status.innerText = "ACCESS GRANTED";

    setTimeout(() => {

      document.getElementById("login").classList.remove("active");

      const screen = document.getElementById("screen");

      screen.classList.remove("hidden");
      screen.style.display = "block";

    }, 300);

  } else {

    status.innerText = "ACCESS DENIED";

  }
}
