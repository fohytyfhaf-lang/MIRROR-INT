export function initLogin() {}

export function loginSystem() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (u === "operator" && p === "0404") {
    document.getElementById("loginStatus").innerText = "ACCESS GRANTED";

    setTimeout(() => {
      document.getElementById("login").classList.remove("active");
      document.getElementById("screen").style.display = "block";
    }, 300);
  } else {
    document.getElementById("loginStatus").innerText = "ACCESS DENIED";
  }
}
