let topZ = 10;
let activeWindow = null;

export function makeWindowDraggable(win) {
  const title = win.querySelector(".title");
  if (!title) return;

  let offsetX = 0, offsetY = 0, dragging = false;

  title.addEventListener("mousedown", (e) => {
    dragging = true;

    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;

    bringToFront(win);
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    win.style.left = (e.clientX - offsetX) + "px";
    win.style.top = (e.clientY - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
}

export function bringToFront(win) {
  topZ++;
  win.style.zIndex = topZ;
  activeWindow = win;
}
