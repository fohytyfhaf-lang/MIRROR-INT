let topZ = 10;

const state = new Map();
const savedStyles = new Map();

/* =========================
        Z-INDEX + FOCUS
========================= */

export function bringToFront(win) {
    topZ++;
    win.style.zIndex = topZ;
}

/* =========================
        DRAG SYSTEM
========================= */

export function makeWindowDraggable(win) {
    const title = win.querySelector(".windowHeader");
    if (!title) return;

    let offsetX = 0, offsetY = 0;
    let dragging = false;

    title.style.cursor = "move";

    title.addEventListener("mousedown", (e) => {
        dragging = true;

        const rect = win.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

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

    win.addEventListener("mousedown", () => {
        bringToFront(win);
    });
}

/* =========================
        OPEN WINDOW
========================= */

export function openWindow(name) {
    const win = document.getElementById(name + "Window");
    if (!win) return;

    win.classList.remove("hidden");
    win.style.display = "flex";

    state.set(name, "open");

    bringToFront(win);
    makeWindowDraggable(win);
}

/* =========================
        CLOSE WINDOW
========================= */

export function closeWindow(name) {
    const win = document.getElementById(name + "Window");
    if (!win) return;

    win.classList.add("hidden");
    win.style.display = "none";

    state.set(name, "closed");
}

/* =========================
        MINIMIZE
========================= */

export function minimizeWindow(name) {
    const win = document.getElementById(name + "Window");
    if (!win) return;

    win.style.display = "none";

    state.set(name, "minimized");
}

/* =========================
        RESTORE
========================= */

export function restoreWindow(name) {
    const win = document.getElementById(name + "Window");
    if (!win) return;

    win.style.display = "flex";

    state.set(name, "open");

    bringToFront(win);
}

/* =========================
        MAXIMIZE / RESTORE
========================= */

export function maximizeWindow(name) {
    const win = document.getElementById(name + "Window");
    if (!win) return;

    if (!savedStyles.has(name)) {
        savedStyles.set(name, {
            left: win.style.left,
            top: win.style.top,
            width: win.style.width,
            height: win.style.height
        });

        win.style.left = "0";
        win.style.top = "60px";
        win.style.width = "100vw";
        win.style.height = "calc(100vh - 60px)";
    } else {
        const old = savedStyles.get(name);

        win.style.left = old.left;
        win.style.top = old.top;
        win.style.width = old.width;
        win.style.height = old.height;

        savedStyles.delete(name);
    }

    bringToFront(win);
}
