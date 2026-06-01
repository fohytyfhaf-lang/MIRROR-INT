export function loginSystem() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (u === "operator" && p === "0404") {

    document.getElementById("status").innerText = "Welcome";

    setTimeout(() => {
      document.getElementById("login").classList.add("hidden");
      document.getElementById("desktop").classList.remove("hidden");
    }, 500);

  } else {
    document.getElementById("status").innerText = "Access Denied";
  }
}

function login() {
  console.log("LOGIN START");

  const desktop = document.getElementById("desktop");

  console.log("DESKTOP =", desktop);

  if (!desktop) {
    alert("desktop is NULL - HTML mismatch or reload issue");
    return;
  }
}
