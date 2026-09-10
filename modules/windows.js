import {
  trigger
} from "./eventManager.js";

let topZ = 10;

/* =========================
   MR.SMILE CONTEXT
========================= */

function reportMrSmileWindowAction(data = {}) {
  try {
    trigger(
      "mrsmile:operatorAction",
      {
        source: "windows",
        page: "system",
        operator: data.operator || "operator",
        ...data
      }
    );
  } catch (error) {
    console.warn(
      "[OMEGA WINDOWS] MR.SMILE context report failed:",
      error
    );
  }
}

/* =========================
   WINDOW HELPERS
========================= */

function getWindowName(win) {
  if (!win) return "unknown";

  if (win.id) {
    return win.id.replace(/Window$/, "");
  }

  return "unknown";
}

function getWindowState(win) {
  if (!win) {
    return null;
  }

  const rect = win.getBoundingClientRect();

  return {
    id: win.id || null,
    name: getWindowName(win),
    left: win.style.left || `${Math.round(rect.left)}px`,
    top: win.style.top || `${Math.round(rect.top)}px`,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    zIndex: win.style.zIndex || null,
    hidden: win.classList.contains("hidden")
  };
}

/* =========================
   OPEN WINDOW
========================= */

export function openApp(name) {
  const win = document.getElementById(name + "Window");

  if (!win) {
    console.warn(
      "[OMEGA WINDOWS] Window not found:",
      name
    );

    return;
  }

  const wasHidden = win.classList.contains("hidden");

  win.classList.remove("hidden");

  bringToFront(
    win,
    wasHidden ? "open" : "focus"
  );

  reportMrSmileWindowAction({
    type: wasHidden
      ? "window_open"
      : "window_focus",

    target: name,

    action: wasHidden
      ? "open"
      : "focus",

    reason: wasHidden
      ? "operator_opened_window"
      : "operator_focused_window",

    metadata: {
      windowId: win.id,
      windowName: name,
      state: getWindowState(win)
    }
  });
}

/* =========================
   CLOSE WINDOW
========================= */

export function closeApp(name) {
  const win = document.getElementById(name + "Window");

  if (!win) {
    console.warn(
      "[OMEGA WINDOWS] Window not found:",
      name
    );

    return;
  }

  const wasHidden = win.classList.contains("hidden");

  win.classList.add("hidden");

  if (!wasHidden) {
    reportMrSmileWindowAction({
      type: "window_close",

      target: name,

      action: "close",

      reason: "operator_closed_window",

      metadata: {
        windowId: win.id,
        windowName: name,
        state: getWindowState(win)
      }
    });
  }
}

/* =========================
   WINDOW FOCUS SYSTEM
========================= */

function bringToFront(
  win,
  source = "focus"
) {
  if (!win) return;

  topZ++;

  win.style.zIndex = topZ;

  /*
   * Внутреннее изменение z-index само по себе
   * НЕ считается действием оператора.
   *
   * Поэтому здесь не отправляем Context.
   *
   * Context отправляется только там,
   * где реально произошло действие пользователя.
   */
}

/* =========================
   FOCUS ON CLICK
========================= */

document.addEventListener(
  "mousedown",
  (e) => {
    const win = e.target.closest(
      ".window, .omegaWindow, [id$='Window']"
    );

    if (!win) return;

    /*
     * Не отправляем focus для каждого клика
     * внутри окна.
     *
     * Фокусируем окно только если оно
     * действительно не является верхним.
     */

    const currentZ =
      parseInt(
        win.style.zIndex || "0",
        10
      );

    if (currentZ < topZ) {
      bringToFront(win, "click");

      reportMrSmileWindowAction({
        type: "window_focus",

        target: getWindowName(win),

        action: "focus",

        reason: "operator_focused_window",

        metadata: {
          windowId: win.id,
          windowName: getWindowName(win),
          zIndex: topZ
        }
      });
    }
  }
);

/* =========================
   DRAG SYSTEM
   Windows-like
========================= */

document.addEventListener(
  "mousedown",
  (e) => {
    const title = e.target.closest(".title");

    if (!title) return;

    const win = title.parentElement;

    if (!win) return;

    /*
     * Если окно уже было сфокусировано,
     * просто поднимаем его.
     */

    bringToFront(win, "drag");

    const rect =
      win.getBoundingClientRect();

    const offsetX =
      e.clientX - rect.left;

    const offsetY =
      e.clientY - rect.top;

    const startLeft =
      parseInt(
        win.style.left || `${Math.round(rect.left)}px`,
        10
      );

    const startTop =
      parseInt(
        win.style.top || `${Math.round(rect.top)}px`,
        10
      );

    let moved = false;

    function move(ev) {
      const newLeft =
        ev.clientX - offsetX;

      const newTop =
        ev.clientY - offsetY;

      /*
       * Проверяем, действительно ли окно
       * переместилось.
       */

      if (
        Math.abs(newLeft - startLeft) > 2 ||
        Math.abs(newTop - startTop) > 2
      ) {
        moved = true;
      }

      win.style.left =
        newLeft + "px";

      win.style.top =
        newTop + "px";
    }

    function up() {
      document.removeEventListener(
        "mousemove",
        move
      );

      document.removeEventListener(
        "mouseup",
        up
      );

      /*
       * Отправляем только ОДНО событие
       * после завершения перемещения.
       */

      if (moved) {
        const finalRect =
          win.getBoundingClientRect();

        reportMrSmileWindowAction({
          type: "window_move",

          target: getWindowName(win),

          action: "move",

          reason: "operator_moved_window",

          metadata: {
            windowId: win.id,

            windowName:
              getWindowName(win),

            previousPosition: {
              left: startLeft,
              top: startTop
            },

            position: {
              left:
                parseInt(
                  win.style.left || "0",
                  10
                ),

              top:
                parseInt(
                  win.style.top || "0",
                  10
                )
            },

            size: {
              width:
                Math.round(
                  finalRect.width
                ),

              height:
                Math.round(
                  finalRect.height
                )
            }
          }
        });
      }
    }

    document.addEventListener(
      "mousemove",
      move
    );

    document.addEventListener(
      "mouseup",
      up
    );
  }
);

/* =========================
   PUBLIC API
========================= */

export function getTopWindowZ() {
  return topZ;
}

export function getWindowElement(name) {
  return document.getElementById(
    name + "Window"
  );
}

export function getWindowInfo(name) {
  const win =
    getWindowElement(name);

  return getWindowState(win);
}

/* =========================
   DEBUG API
========================= */

window.OMEGA_WINDOWS = {

  open(name) {
    return openApp(name);
  },

  close(name) {
    return closeApp(name);
  },

  focus(name) {
    const win =
      getWindowElement(name);

    if (!win) {
      console.warn(
        "[OMEGA WINDOWS] Window not found:",
        name
      );

      return;
    }

    bringToFront(
      win,
      "debug"
    );

    reportMrSmileWindowAction({
      type: "window_focus",

      target: name,

      action: "focus",

      reason: "debug_focus_window",

      metadata: {
        windowId: win.id,
        windowName: name,
        zIndex: topZ
      }
    });
  },

  info(name) {
    return getWindowInfo(name);
  },

  z() {
    return getTopWindowZ();
  }

};

console.log(
  "[OMEGA WINDOWS] Window system initialized."
);
