export function initClock() {

  const chat = document.getElementById("chatLog");

  setInterval(() => {

    const h = new Date().getHours();

    if (h >= 22 || h <= 5) {
      chat.innerText += "\nSYSTEM: night protocol active";
    }

  }, 15000);
}
