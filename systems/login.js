export function initLogin() {}

export function loginSystem() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  const status = document.getElementById("loginStatus");

  if (
    (u === "operator" && p === "0404") ||
    (u === "omega" && p === "mirror")
  ) {
    status.innerText = "ACCESS GRANTED";

    setTimeout(() => {
      document.getElementById("login").style.display = "none";
      document.getElementById("screen").classList.remove("hidden");
    }, 500);

  } else {
    status.innerText = "ACCESS DENIED";
  }
}
