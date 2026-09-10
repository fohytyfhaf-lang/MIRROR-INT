import {
    trigger
} from "./eventManager.js";


let topZ = 10;

const state = new Map();
const savedStyles = new Map();


/* =========================
        MR.SMILE CONTEXT
========================= */

function reportMrSmileWindowAction(data = {}) {

    try {

        trigger(
            "mrsmile:operatorAction",
            {
                source: "windowManager",
                page: "system",
                operator: data.operator || "operator",
                ...data
            }
        );

    } catch (error) {

        console.warn(
            "[OMEGA WINDOW MANAGER] MR.SMILE context report failed:",
            error
        );

    }
}


/* =========================
        WINDOW HELPERS
========================= */

function getWindowName(win) {

    if (!win) {
        return "unknown";
    }

    if (win.id) {

        return win.id.replace(
            /Window$/,
            ""
        );

    }

    return "unknown";
}


function getWindowState(win) {

    if (!win) {
        return null;
    }

    const rect =
        win.getBoundingClientRect();

    return {

        id:
            win.id || null,

        name:
            getWindowName(win),

        display:
            win.style.display || "",

        hidden:
            win.classList.contains("hidden"),

        left:
            win.style.left ||
            `${Math.round(rect.left)}px`,

        top:
            win.style.top ||
            `${Math.round(rect.top)}px`,

        width:
            Math.round(rect.width),

        height:
            Math.round(rect.height),

        zIndex:
            win.style.zIndex || null

    };

}


/* =========================
        Z-INDEX + FOCUS
========================= */

export function bringToFront(win) {

    if (!win) {
        return;
    }

    topZ++;

    win.style.zIndex =
        topZ;

}


/* =========================
        DRAG SYSTEM
========================= */

export function makeWindowDraggable(win) {

    const title =
        win.querySelector(
            ".windowHeader"
        );

    if (!title) {
        return;
    }


    let offsetX = 0;
    let offsetY = 0;

    let dragging = false;

    let startLeft = 0;
    let startTop = 0;


    title.style.cursor = "move";


    title.addEventListener(
        "mousedown",
        (e) => {

            /*
             * Левая кнопка мыши.
             */

            if (e.button !== 0) {
                return;
            }


            dragging = true;


            const rect =
                win.getBoundingClientRect();


            offsetX =
                e.clientX -
                rect.left;

            offsetY =
                e.clientY -
                rect.top;


            startLeft =
                parseInt(
                    win.style.left ||
                    `${Math.round(rect.left)}`,
                    10
                );

            startTop =
                parseInt(
                    win.style.top ||
                    `${Math.round(rect.top)}`,
                    10
                );


            bringToFront(win);


            /*
             * Не отправляем window_focus
             * здесь отдельно.
             *
             * Само перемещение уже является
             * отдельным действием.
             */

        }
    );


    function moveWindow(e) {

        if (!dragging) {
            return;
        }


        win.style.left =
            (e.clientX - offsetX) +
            "px";

        win.style.top =
            (e.clientY - offsetY) +
            "px";

    }


    function stopDragging() {

        if (!dragging) {
            return;
        }


        dragging = false;


        const finalLeft =
            parseInt(
                win.style.left || "0",
                10
            );

        const finalTop =
            parseInt(
                win.style.top || "0",
                10
            );


        /*
         * Отправляем событие только если
         * окно действительно переместилось.
         */

        if (
            Math.abs(
                finalLeft -
                startLeft
            ) > 2 ||

            Math.abs(
                finalTop -
                startTop
            ) > 2
        ) {

            reportMrSmileWindowAction({

                type:
                    "window_move",

                target:
                    getWindowName(win),

                action:
                    "move",

                reason:
                    "operator_moved_window",

                metadata: {

                    windowId:
                        win.id,

                    windowName:
                        getWindowName(win),

                    previousPosition: {

                        left:
                            startLeft,

                        top:
                            startTop

                    },

                    position: {

                        left:
                            finalLeft,

                        top:
                            finalTop

                    },

                    zIndex:
                        win.style.zIndex ||
                        null

                }

            });

        }

    }


    document.addEventListener(
        "mousemove",
        moveWindow
    );


    document.addEventListener(
        "mouseup",
        stopDragging
    );


    /*
     * Любой клик по окну поднимает его.
     *
     * Но MR.SMILE получает focus только
     * если окно реально сменило верхний слой.
     */

    win.addEventListener(
        "mousedown",
        () => {

            const oldZ =
                parseInt(
                    win.style.zIndex ||
                    "0",
                    10
                );


            if (oldZ < topZ) {

                bringToFront(win);


                reportMrSmileWindowAction({

                    type:
                        "window_focus",

                    target:
                        getWindowName(win),

                    action:
                        "focus",

                    reason:
                        "operator_focused_window",

                    metadata: {

                        windowId:
                            win.id,

                        windowName:
                            getWindowName(win),

                        zIndex:
                            topZ

                    }

                });

            }

        }
    );

}


/* =========================
        OPEN WINDOW
========================= */

export function openWindow(name) {

    const win =
        document.getElementById(
            name + "Window"
        );


    if (!win) {

        console.warn(
            "[OMEGA WINDOW MANAGER] Window not found:",
            name
        );

        return;

    }


    const wasHidden =
        win.classList.contains(
            "hidden"
        );


    const previousState =
        state.get(name) ||
        "closed";


    win.classList.remove(
        "hidden"
    );

    win.style.display =
        "flex";


    state.set(
        name,
        "open"
    );


    bringToFront(win);


    /*
     * Инициализируем drag только один раз.
     */

    if (
        !win.dataset
            .draggableInitialized
    ) {

        makeWindowDraggable(
            win
        );

        win.dataset
            .draggableInitialized =
            "true";

    }


    /*
     * MR.SMILE Context
     */

    reportMrSmileWindowAction({

        type:
            "window_open",

        target:
            name,

        action:
            "open",

        reason:
            "operator_opened_window",

        metadata: {

            windowId:
                win.id,

            windowName:
                name,

            previousState:
                previousState,

            wasHidden:
                wasHidden,

            state:
                getWindowState(win)

        }

    });

}


/* =========================
        CLOSE WINDOW
========================= */

export function closeWindow(name) {

    const win =
        document.getElementById(
            name + "Window"
        );


    if (!win) {

        console.warn(
            "[OMEGA WINDOW MANAGER] Window not found:",
            name
        );

        return;

    }


    const previousState =
        state.get(name) ||
        "open";


    win.classList.add(
        "hidden"
    );

    win.style.display =
        "none";


    state.set(
        name,
        "closed"
    );


    /*
     * MR.SMILE Context
     */

    reportMrSmileWindowAction({

        type:
            "window_close",

        target:
            name,

        action:
            "close",

        reason:
            "operator_closed_window",

        metadata: {

            windowId:
                win.id,

            windowName:
                name,

            previousState:
                previousState,

            state:
                getWindowState(win)

        }

    });

}


/* =========================
        MINIMIZE
========================= */

export function minimizeWindow(name) {

    const win =
        document.getElementById(
            name + "Window"
        );


    if (!win) {

        console.warn(
            "[OMEGA WINDOW MANAGER] Window not found:",
            name
        );

        return;

    }


    const previousState =
        state.get(name) ||
        "open";


    win.style.display =
        "none";


    state.set(
        name,
        "minimized"
    );


    /*
     * MR.SMILE Context
     */

    reportMrSmileWindowAction({

        type:
            "window_minimize",

        target:
            name,

        action:
            "minimize",

        reason:
            "operator_minimized_window",

        metadata: {

            windowId:
                win.id,

            windowName:
                name,

            previousState:
                previousState

        }

    });

}


/* =========================
        RESTORE
========================= */

export function restoreWindow(name) {

    const win =
        document.getElementById(
            name + "Window"
        );


    if (!win) {

        console.warn(
            "[OMEGA WINDOW MANAGER] Window not found:",
            name
        );

        return;

    }


    const previousState =
        state.get(name) ||
        "minimized";


    win.classList.remove(
        "hidden"
    );

    win.style.display =
        "flex";


    state.set(
        name,
        "open"
    );


    bringToFront(win);


    /*
     * MR.SMILE Context
     */

    reportMrSmileWindowAction({

        type:
            "window_restore",

        target:
            name,

        action:
            "restore",

        reason:
            "operator_restored_window",

        metadata: {

            windowId:
                win.id,

            windowName:
                name,

            previousState:
                previousState,

            state:
                getWindowState(win)

        }

    });

}


/* =========================
        MAXIMIZE / RESTORE
========================= */

export function maximizeWindow(name) {

    const win =
        document.getElementById(
            name + "Window"
        );


    if (!win) {

        console.warn(
            "[OMEGA WINDOW MANAGER] Window not found:",
            name
        );

        return;

    }


    /*
     * MAXIMIZE
     */

    if (!savedStyles.has(name)) {

        savedStyles.set(
            name,
            {

                left:
                    win.style.left,

                top:
                    win.style.top,

                width:
                    win.style.width,

                height:
                    win.style.height

            }
        );


        win.style.left =
            "0";

        win.style.top =
            "60px";

        win.style.width =
            "100vw";

        win.style.height =
            "calc(100vh - 60px)";


        state.set(
            name,
            "maximized"
        );


        bringToFront(win);


        reportMrSmileWindowAction({

            type:
                "window_maximize",

            target:
                name,

            action:
                "maximize",

            reason:
                "operator_maximized_window",

            metadata: {

                windowId:
                    win.id,

                windowName:
                    name,

                previousState:
                    "open",

                state:
                    getWindowState(win)

            }

        });

    }

    /*
     * RESTORE FROM MAXIMIZED
     */

    else {

        const old =
            savedStyles.get(
                name
            );


        win.style.left =
            old.left;

        win.style.top =
            old.top;

        win.style.width =
            old.width;

        win.style.height =
            old.height;


        savedStyles.delete(
            name
        );


        state.set(
            name,
            "open"
        );


        bringToFront(win);


        reportMrSmileWindowAction({

            type:
                "window_restore",

            target:
                name,

            action:
                "restore",

            reason:
                "operator_restored_maximized_window",

            metadata: {

                windowId:
                    win.id,

                windowName:
                    name,

                previousState:
                    "maximized",

                state:
                    getWindowState(win)

            }

        });

    }

}


/* =========================
   INITIALIZE WINDOWS
========================= */

export function initializeWindows() {

    const windows =
        document.querySelectorAll(
            "#workspace > .window"
        );


    windows.forEach(
        win => {

            win.classList.add(
                "hidden"
            );

            win.style.display =
                "none";


            /*
             * Начальное состояние
             * не является действием оператора.
             */

            const name =
                getWindowName(win);


            state.set(
                name,
                "closed"
            );

        }
    );


    console.log(
        "[OMEGA WINDOW MANAGER] Windows initialized:",
        windows.length
    );

}


/* =========================
        PUBLIC STATE API
========================= */

export function getWindowStateByName(name) {

    return state.get(name) || null;

}


export function getAllWindowStates() {

    const result = {};

    state.forEach(
        (value, key) => {

            result[key] =
                value;

        }
    );

    return result;

}


export function getWindowInfo(name) {

    const win =
        document.getElementById(
            name + "Window"
        );


    if (!win) {
        return null;
    }


    return {

        state:
            state.get(name) ||
            null,

        window:
            getWindowState(win)

    };

}


export function getTopZ() {

    return topZ;

}


/* =========================
        DEBUG API
========================= */

window.OMEGA_WINDOWS = {

    open(name) {

        return openWindow(name);

    },


    close(name) {

        return closeWindow(name);

    },


    minimize(name) {

        return minimizeWindow(name);

    },


    restore(name) {

        return restoreWindow(name);

    },


    maximize(name) {

        return maximizeWindow(name);

    },


    focus(name) {

        const win =
            document.getElementById(
                name + "Window"
            );


        if (!win) {

            console.warn(
                "[OMEGA WINDOW MANAGER] Window not found:",
                name
            );

            return;

        }


        bringToFront(win);


        reportMrSmileWindowAction({

            type:
                "window_focus",

            target:
                name,

            action:
                "focus",

            reason:
                "debug_focus_window",

            metadata: {

                windowId:
                    win.id,

                windowName:
                    name,

                zIndex:
                    topZ

            }

        });

    },


    info(name) {

        return getWindowInfo(name);

    },


    state(name) {

        return getWindowStateByName(
            name
        );

    },


    states() {

        return getAllWindowStates();

    },


    z() {

        return getTopZ();

    }

};


console.log(
    "[OMEGA WINDOW MANAGER] Initialized."
);
