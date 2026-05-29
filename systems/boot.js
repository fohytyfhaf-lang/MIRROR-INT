export function initBoot() {
  const login = document.getElementById("login");
  const screen = document.getElementById("screen");

  setTimeout(() => {
    login.style.display = "flex";
    screen.classList.add("hidden");
  }, 1000);
}
