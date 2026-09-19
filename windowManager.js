
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
                operator:
                    data.operator ||
                    "operator",
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
            win.id ||
            null,

        name:
            getWindowName(win),

        display:
            win.style.display ||
            "",

        hidden:
            win.classList.contains(
                "hidden"
            ),

        left:
            win.style.left ||
            `${Math.round(
                rect.left
            )}px`,

        top:
            win.style.top ||
            `${Math.round(
                rect.top
            )}px`,

        width:
            Math.round(
                rect.width
            ),

        height:
            Math.round(
                rect.height
            ),

        zIndex:
            win.style.zIndex ||
            null

    };

}


/* =========================
        INITIAL POSITION
========================= */

/*
 * Каждому окну назначается собственная
 * начальная позиция внутри workspace.
 *
 * Окна больше не появляются строго
 * друг на друге.
 */

function placeWindow(win) {

    if (!win) {
        return;
    }


    /*
     * Если пользователь уже двигал окно,
     * его позицию не трогаем.
     */

    if (
        win.dataset.positionInitialized ===
        "true"
    ) {

        return;

    }


    const workspace =
        document.getElementById(
            "workspace"
        );


    if (!workspace) {
        return;
    }


    const rect =
        win.getBoundingClientRect();


    const width =
        rect.width;

    const height =
        rect.height;


    /*
     * Считаем уже открытые окна,
     * у которых есть начальная позиция.
     */

    const existingPositionedWindows =
        Array.from(
            workspace.querySelectorAll(
                ".window"
            )
        ).filter(
            other =>
                other !== win &&
                other.dataset.positionInitialized ===
                    "true" &&
                getComputedStyle(
                    other
                ).display !==
                    "none"
        ).length;


    /*
     * Небольшое смещение каждого
     * следующего окна.
     */

    const stagger =
        (
            existingPositionedWindows %
            5
        ) * 28;


    /*
     * Центр workspace.
     */

    const centeredLeft =
        (
            workspace.clientWidth -
            width
        ) / 2;


    const centeredTop =
        (
            workspace.clientHeight -
            height
        ) / 2;


    /*
     * Не позволяем окну уйти
     * за границы workspace.
     */

    const maxLeft =
        Math.max(
            12,
            workspace.clientWidth -
            width -
            12
        );


    const maxTop =
        Math.max(
            12,
            workspace.clientHeight -
            height -
            12
        );


    const left =
        Math.min(

            Math.max(
                12,
                Math.round(
                    centeredLeft +
                    stagger
                )
            ),

            maxLeft

        );


    const top =
        Math.min(

            Math.max(
                12,
                Math.round(
                    centeredTop +
                    stagger
                )
            ),

            maxTop

        );


    win.style.left =
        left +
        "px";


    win.style.top =
        top +
        "px";


    win.dataset.positionInitialized =
        "true";

}


/* =========================
        Z-INDEX + FOCUS
========================= */

export function bringToFront(
    win
) {

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

export function makeWindowDraggable(
    win
) {

    const title =
        win.querySelector(
            ".windowHeader"
        );


    const workspace =
        document.getElementById(
            "workspace"
        );


    if (!title) {
        return;
    }


    let offsetX =
        0;

    let offsetY =
        0;

    let dragging =
        false;

    let startLeft =
        0;

    let startTop =
        0;


    title.style.cursor =
        "move";


    title.addEventListener(
        "mousedown",
        (e) => {

            /*
             * Только левая кнопка.
             */

            if (
                e.button !==
                0
            ) {

                return;

            }


            dragging =
                true;


            const rect =
                win.getBoundingClientRect();


            const workspaceRect =
                workspace
                    ? workspace.getBoundingClientRect()
                    : {
                        left:
                            0,

                        top:
                            0
                    };


            /*
             * Точка клика внутри окна.
             */

            offsetX =
                e.clientX -
                rect.left;


            offsetY =
                e.clientY -
                rect.top;


            /*
             * Координаты теперь
             * считаются относительно
             * workspace, а не экрана.
             */

            startLeft =
                parseInt(
                    win.style.left ||
                    "0",
                    10
                );


            if (!win.style.left) {

                startLeft =
                    Math.round(
                        rect.left -
                        workspaceRect.left
                    );

            }


            startTop =
                parseInt(
                    win.style.top ||
                    "0",
                    10
                );


            if (!win.style.top) {

                startTop =
                    Math.round(
                        rect.top -
                        workspaceRect.top
                    );

            }


            bringToFront(
                win
            );

        }
    );


    function moveWindow(e) {

        if (!dragging) {
            return;
        }


        const workspaceRect =
            workspace
                ? workspace.getBoundingClientRect()
                : {
                    left:
                        0,

                    top:
                        0
                };


        /*
         * Максимальная позиция
         * внутри workspace.
         */

        const maxLeft =
            workspace
                ? Math.max(
                    12,
                    workspace.clientWidth -
                    win.offsetWidth -
                    12
                )
                : Number.POSITIVE_INFINITY;


        const maxTop =
            workspace
                ? Math.max(
                    12,
                    workspace.clientHeight -
                    win.offsetHeight -
                    12
                )
                : Number.POSITIVE_INFINITY;


        /*
         * Новые координаты
         * относительно workspace.
         */

        const nextLeft =
            Math.min(

                Math.max(
                    12,

                    e.clientX -
                    workspaceRect.left -
                    offsetX
                ),

                maxLeft

            );


        const nextTop =
            Math.min(

                Math.max(
                    12,

                    e.clientY -
                    workspaceRect.top -
                    offsetY
                ),

                maxTop

            );


        win.style.left =
            nextLeft +
            "px";


        win.style.top =
            nextTop +
            "px";

    }


    function stopDragging() {

        if (!dragging) {
            return;
        }


        dragging =
            false;


        const finalLeft =
            parseInt(
                win.style.left ||
                "0",
                10
            );


        const finalTop =
            parseInt(
                win.style.top ||
                "0",
                10
            );


        /*
         * Событие движения отправляется
         * только если окно реально
         * изменило позицию.
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
                    getWindowName(
                        win
                    ),

                action:
                    "move",

                reason:
                    "operator_moved_window",

                metadata: {

                    windowId:
                        win.id,

                    windowName:
                        getWindowName(
                            win
                        ),

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
     * Клик по окну
     * поднимает его наверх.
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


            if (
                oldZ <
                topZ
            ) {

                bringToFront(
                    win
                );


                reportMrSmileWindowAction({

                    type:
                        "window_focus",

                    target:
                        getWindowName(
                            win
                        ),

                    action:
                        "focus",

                    reason:
                        "operator_focused_window",

                    metadata: {

                        windowId:
                            win.id,

                        windowName:
                            getWindowName(
                                win
                            ),

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

export function openWindow(
    name
) {

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
        state.get(
            name
        ) ||
        "closed";


    win.classList.remove(
        "hidden"
    );


    win.style.display =
        "flex";


    /*
     * Назначаем стартовую позицию
     * только один раз.
     */

    placeWindow(
        win
    );


    state.set(
        name,
        "open"
    );


    bringToFront(
        win
    );


    /* ======================================================
       OPERATOR PROFILE
    ====================================================== */

    if (

        name ===
        "operatorProfile" &&

        typeof window !==
            "undefined" &&

        typeof window.loadOperatorProfile ===
            "function"

    ) {

        window.loadOperatorProfile();

    }


    /*
     * Инициализируем drag
     * только один раз.
     */

    if (
        !win.dataset.draggableInitialized
    ) {

        makeWindowDraggable(
            win
        );

        win.dataset.draggableInitialized =
            "true";

    }


    /*
     * MR.SMILE CONTEXT
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
                getWindowState(
                    win
                )

        }

    });

}


/* =========================
        CLOSE WINDOW
========================= */

export function closeWindow(
    name
) {

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
        state.get(
            name
        ) ||
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
                getWindowState(
                    win
                )

        }

    });

}


/* =========================
        MINIMIZE
========================= */

export function minimizeWindow(
    name
) {

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
        state.get(
            name
        ) ||
        "open";


    win.style.display =
        "none";


    state.set(
        name,
        "minimized"
    );


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

export function restoreWindow(
    name
) {

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
        state.get(
            name
        ) ||
        "minimized";


    win.classList.remove(
        "hidden"
    );


    win.style.display =
        "flex";


    /*
     * Если окно никогда не
     * получало позицию — выдаём её.
     *
     * Если уже двигалось —
     * сохраняем её.
     */

    placeWindow(
        win
    );


    state.set(
        name,
        "open"
    );


    bringToFront(
        win
    );


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
                getWindowState(
                    win
                )

        }

    });

}


/* =========================
        MAXIMIZE / RESTORE
========================= */

export function maximizeWindow(
    name
) {

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

    if (
        !savedStyles.has(
            name
        )
    ) {

        /*
         * На всякий случай гарантируем,
         * что у окна есть нормальная
         * начальная позиция.
         */

        placeWindow(
            win
        );


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


        /*
         * Максимизируем именно
         * относительно workspace.
         *
         * Не 100vw / 100vh.
         */

        win.style.left =
            "0px";


        win.style.top =
            "0px";


        win.style.width =
            "100%";


        win.style.height =
            "100%";


        state.set(
            name,
            "maximized"
        );


        bringToFront(
            win
        );


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
                    getWindowState(
                        win
                    )

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


        bringToFront(
            win
        );


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
                    getWindowState(
                        win
                    )

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
                getWindowName(
                    win
                );


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

export function getWindowStateByName(
    name
) {

    return (
        state.get(
            name
        ) ||
        null
    );

}


export function getAllWindowStates() {

    const result =
        {};


    state.forEach(
        (
            value,
            key
        ) => {

            result[key] =
                value;

        }
    );


    return result;

}


export function getWindowInfo(
    name
) {

    const win =
        document.getElementById(
            name + "Window"
        );


    if (!win) {
        return null;
    }


    return {

        state:
            state.get(
                name
            ) ||
            null,

        window:
            getWindowState(
                win
            )

    };

}


export function getTopZ() {

    return topZ;

}


/* =========================
        DEBUG API
========================= */

window.OMEGA_WINDOWS = {

    open(
        name
    ) {

        return openWindow(
            name
        );

    },


    close(
        name
    ) {

        return closeWindow(
            name
        );

    },


    minimize(
        name
    ) {

        return minimizeWindow(
            name
        );

    },


    restore(
        name
    ) {

        return restoreWindow(
            name
        );

    },


    maximize(
        name
    ) {

        return maximizeWindow(
            name
        );

    },


    focus(
        name
    ) {

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


        bringToFront(
            win
        );


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


    info(
        name
    ) {

        return getWindowInfo(
            name
        );

    },


    state(
        name
    ) {

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
