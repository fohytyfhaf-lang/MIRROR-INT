export function loginSystem() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (
    (u === "operator" && p === "0404") ||
    (u === "omega" && p === "mirror")
  ) {
    document.getElementById("login").style.display = "none";
    document.getElementById("screen").style.display = "block";
  } else {
    document.getElementById("loginStatus").innerText = "ACCESS DENIED";
  }
}
