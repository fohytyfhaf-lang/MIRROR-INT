export function loginSystem() {
  console.log("LOGIN CLICKED");

  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (u === "operator" && p === "0404") {

    document.getElementById("loginStatus").innerText = "OK";

    setTimeout(() => {
      document.getElementById("login").classList.add("hidden");
      document.getElementById("desktop").classList.remove("hidden");
    }, 500);

  } else {
    document.getElementById("loginStatus").innerText = "NO ACCESS";
  }
}
