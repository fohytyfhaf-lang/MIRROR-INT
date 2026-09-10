import {
    on,
    trigger
} from "./eventManager.js";


/* ==========================================================
   MR.SMILE STATE
   Центральное текущее состояние присутствия MR.SMILE
========================================================== */


/* =========================
        STORAGE
========================= */

const STORAGE_KEY =
    "mrsmile_state";


/* =========================
        DEFAULT STATE
========================= */

const DEFAULT_STATE = {

    /*
     * Состояние присутствия.
     */

    present: false,

    firstContact: false,

    accepted: false,


    /*
     * Текущее состояние OMEGA.
     */

    activeWindow: null,

    openWindows: [],

    currentPage: null,

    currentSection: null,


    /*
     * Последние действия оператора.
     */

    lastOperatorAction: null,

    lastOperatorContext: null,

    lastOperatorTimestamp: null,


    /*
     * Explorer.
     */

    lastFile: null,

    lastFolder: null,

    lastExplorerPath: null,


    /*
     * Console.
     */

    lastCommand: null,

    lastConsoleAction: null,


    /*
     * Camera.
     */

    lastCamera: null,

    lastCameraIndex: null,


    /*
     * Window activity.
     */

    lastOpenedWindow: null,

    lastClosedWindow: null,

    lastMovedWindow: null,

    lastFocusedWindow: null,


    /*
     * Activity statistics.
     */

    interactionCount: 0,

    contextCount: 0,

    windowActivityCount: 0,

    fileActivityCount: 0,

    consoleActivityCount: 0,

    cameraActivityCount: 0,


    /*
     * MR.SMILE internal activity.
     */

    lastDecision: null,

    lastAction: null,

    lastMrSmileActivity: null,


    /*
     * Timing.
     */

    createdAt: null,

    lastActivity: null

};


/* =========================
        INTERNAL STATE
========================= */

let state = createDefaultState();

let initialized = false;


/* ==========================================================
   HELPERS
========================================================== */


/* =========================
        CREATE DEFAULT
========================= */

function createDefaultState() {

    return JSON.parse(
        JSON.stringify(
            DEFAULT_STATE
        )
    );

}


/* =========================
        LOAD STORAGE
========================= */

function loadState() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw) {

            state =
                createDefaultState();

            return;

        }


        const saved =
            JSON.parse(raw);


        state = {

            ...createDefaultState(),

            ...saved

        };


        /*
         * Защита от повреждённого массива.
         */

        if (!Array.isArray(
            state.openWindows
        )) {

            state.openWindows = [];

        }

    }

    catch (error) {

        console.warn(
            "[MR.SMILE STATE] Failed to load state:",
            error
        );


        state =
            createDefaultState();

    }

}


/* =========================
        SAVE STORAGE
========================= */

function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    }

    catch (error) {

        console.warn(
            "[MR.SMILE STATE] Failed to save state:",
            error
        );

    }

}


/* =========================
        TIMESTAMP
========================= */

function now() {

    return Date.now();

}


/* =========================
        CLONE
========================= */

function clone(data) {

    if (
        data === null ||
        data === undefined
    ) {

        return data;

    }


    try {

        return JSON.parse(
            JSON.stringify(data)
        );

    }

    catch {

        return data;

    }

}


/* =========================
        UPDATE
========================= */

function updateState(
    changes = {},
    reason = "state_update"
) {

    state = {

        ...state,

        ...changes

    };


    saveState();


    trigger(
        "mrsmile:stateChanged",
        {

            state:
                clone(state),

            changes:
                clone(changes),

            reason,

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   WINDOW STATE
========================================================== */


/* =========================
        WINDOW OPEN
========================= */

function handleWindowOpen(data) {

    if (!data) {
        return;
    }


    const name =
        data.target ||
        data.windowName ||
        data.name;


    if (!name) {
        return;
    }


    const windows =
        [...state.openWindows];


    /*
     * Не добавляем дубликаты.
     */

    if (!windows.includes(name)) {

        windows.push(name);

    }


    updateState(

        {

            activeWindow:
                name,

            openWindows:
                windows,

            lastOpenedWindow:
                name,

            lastActivity:
                now(),

            windowActivityCount:
                state.windowActivityCount + 1,

            interactionCount:
                state.interactionCount + 1

        },

        "window_open"

    );

}


/* =========================
        WINDOW CLOSE
========================= */

function handleWindowClose(data) {

    if (!data) {
        return;
    }


    const name =
        data.target ||
        data.windowName ||
        data.name;


    if (!name) {
        return;
    }


    const windows =
        state.openWindows.filter(
            windowName =>
                windowName !== name
        );


    let activeWindow =
        state.activeWindow;


    if (
        activeWindow === name
    ) {

        activeWindow =
            windows.length > 0
                ? windows[windows.length - 1]
                : null;

    }


    updateState(

        {

            activeWindow,

            openWindows:
                windows,

            lastClosedWindow:
                name,

            lastActivity:
                now(),

            windowActivityCount:
                state.windowActivityCount + 1,

            interactionCount:
                state.interactionCount + 1

        },

        "window_close"

    );

}


/* =========================
        WINDOW FOCUS
========================= */

function handleWindowFocus(data) {

    if (!data) {
        return;
    }


    const name =
        data.target ||
        data.windowName ||
        data.name;


    if (!name) {
        return;
    }


    const windows =
        [...state.openWindows];


    if (!windows.includes(name)) {

        windows.push(name);

    }


    updateState(

        {

            activeWindow:
                name,

            openWindows:
                windows,

            lastFocusedWindow:
                name,

            lastActivity:
                now(),

            windowActivityCount:
                state.windowActivityCount + 1,

            interactionCount:
                state.interactionCount + 1

        },

        "window_focus"

    );

}


/* =========================
        WINDOW MOVE
========================= */

function handleWindowMove(data) {

    if (!data) {
        return;
    }


    const name =
        data.target ||
        data.windowName ||
        data.name;


    if (!name) {
        return;
    }


    updateState(

        {

            lastMovedWindow:
                {

                    name,

                    position:
                        clone(
                            data.metadata?.position ||
                            null
                        ),

                    previousPosition:
                        clone(
                            data.metadata?.previousPosition ||
                            null
                        ),

                    timestamp:
                        now()

                },

            activeWindow:
                name,

            lastActivity:
                now(),

            windowActivityCount:
                state.windowActivityCount + 1,

            interactionCount:
                state.interactionCount + 1

        },

        "window_move"

    );

}


/* ==========================================================
   EXPLORER STATE
========================================================== */


/* =========================
        FILE OPEN
========================= */

function handleFileOpen(data) {

    if (!data) {
        return;
    }


    const target =
        data.target ||
        null;


    const metadata =
        data.metadata ||
        {};


    updateState(

        {

            lastFile:
                {

                    name:
                        metadata.name ||
                        target,

                    path:
                        metadata.path ||
                        null,

                    extension:
                        metadata.extension ||
                        null,

                    itemType:
                        metadata.itemType ||
                        null,

                    timestamp:
                        now()

                },

            lastExplorerPath:
                metadata.currentPath ||
                state.lastExplorerPath,

            lastActivity:
                now(),

            fileActivityCount:
                state.fileActivityCount + 1,

            interactionCount:
                state.interactionCount + 1

        },

        "file_open"

    );

}


/* =========================
        FOLDER OPEN
========================= */

function handleFolderOpen(data) {

    if (!data) {
        return;
    }


    const metadata =
        data.metadata ||
        {};


    const path =
        metadata.currentPath ||
        metadata.path ||
        data.target ||
        null;


    updateState(

        {

            lastFolder:
                {

                    name:
                        metadata.name ||
                        null,

                    path,

                    previousPath:
                        metadata.previousPath ||
                        null,

                    timestamp:
                        now()

                },

            lastExplorerPath:
                path,

            lastActivity:
                now(),

            fileActivityCount:
                state.fileActivityCount + 1,

            interactionCount:
                state.interactionCount + 1

        },

        "folder_open"

    );

}


/* =========================
        FOLDER CLOSE
========================= */

function handleFolderClose(data) {

    if (!data) {
        return;
    }


    const metadata =
        data.metadata ||
        {};


    updateState(

        {

            lastExplorerPath:
                metadata.currentPath ||
                metadata.previousPath ||
                state.lastExplorerPath,

            lastActivity:
                now(),

            fileActivityCount:
                state.fileActivityCount + 1,

            interactionCount:
                state.interactionCount + 1

        },

        "folder_close"

    );

}


/* ==========================================================
   CONSOLE STATE
========================================================== */


/* =========================
        CONSOLE COMMAND
========================= */

function handleConsoleCommand(data) {

    if (!data) {
        return;
    }


    const command =
        data.target ||
        data.metadata?.command ||
        null;


    if (!command) {
        return;
    }


    updateState(

        {

            lastCommand:
                {

                    command,

                    action:
                        data.action ||
                        null,

                    reason:
                        data.reason ||
                        null,

                    role:
                        data.metadata?.role ||
                        null,

                    clearance:
                        data.metadata?.clearance ??
                        null,

                    timestamp:
                        now()

                },

            lastConsoleAction:
                clone(data),

            lastActivity:
                now(),

            consoleActivityCount:
                state.consoleActivityCount + 1,

            interactionCount:
                state.interactionCount + 1

        },

        "console_command"

    );

}


/* ==========================================================
   CAMERA STATE
========================================================== */


/* =========================
        CAMERA ACTION
========================= */

function handleCameraAction(data) {

    if (!data) {
        return;
    }


    const metadata =
        data.metadata ||
        {};


    const currentCamera =
        metadata.currentCamera ||
        metadata.camera ||
        data.target ||
        null;


    const currentIndex =
        metadata.currentIndex ??
        metadata.cameraIndex ??
        null;


    updateState(

        {

            lastCamera:
                currentCamera,

            lastCameraIndex:
                currentIndex,

            lastActivity:
                now(),

            cameraActivityCount:
                state.cameraActivityCount + 1,

            interactionCount:
                state.interactionCount + 1

        },

        data.type ||
        "camera_action"

    );

}


/* ==========================================================
   GENERIC OPERATOR CONTEXT
========================================================== */


/* =========================
        OPERATOR ACTION
========================= */

function handleOperatorAction(data) {

    if (!data) {
        return;
    }


    updateState(

        {

            lastOperatorAction:
                clone(data),

            lastOperatorTimestamp:
                now(),

            lastActivity:
                now(),

            interactionCount:
                state.interactionCount + 1

        },

        "operator_action"

    );

}


/* =========================
        CONTEXT CREATED
========================= */

function handleContextCreated(data) {

    if (!data) {
        return;
    }


    updateState(

        {

            lastOperatorContext:
                clone(data),

            lastActivity:
                now(),

            contextCount:
                state.contextCount + 1

        },

        "context_created"

    );

}


/* ==========================================================
   MR.SMILE ACTIVITY
========================================================== */


/* =========================
        BEHAVIOR DECISION
========================= */

function handleBehaviorDecision(data) {

    if (!data) {
        return;
    }


    updateState(

        {

            lastDecision:
                clone(data),

            lastMrSmileActivity:
                {

                    type:
                        "decision",

                    data:
                        clone(data),

                    timestamp:
                        now()

                },

            lastActivity:
                now()

        },

        "behavior_decision"

    );

}


/* =========================
        ACTION STARTED
========================= */

function handleActionStarted(data) {

    if (!data) {
        return;
    }


    updateState(

        {

            lastAction:
                clone(data),

            lastMrSmileActivity:
                {

                    type:
                        "action",

                    data:
                        clone(data),

                    timestamp:
                        now()

                },

            lastActivity:
                now()

        },

        "action_started"

    );

}


/* ==========================================================
   MR.SMILE PRESENCE
========================================================== */


/* =========================
        SET PRESENCE
========================= */

export function setMrSmilePresence(
    present = true,
    reason = "presence_changed"
) {

    updateState(

        {

            present:
                Boolean(present),

            lastActivity:
                now()

        },

        reason

    );

}


/* =========================
        FIRST CONTACT
========================= */

export function markMrSmileFirstContact(
    accepted = false
) {

    updateState(

        {

            firstContact:
                true,

            accepted:
                Boolean(accepted),

            present:
                true,

            createdAt:
                state.createdAt ||
                now(),

            lastActivity:
                now()

        },

        accepted
            ? "first_contact_accepted"
            : "first_contact"

    );

}


/* =========================
        ACCEPT
========================= */

export function acceptMrSmile() {

    markMrSmileFirstContact(
        true
    );

}


/* ==========================================================
   PUBLIC STATE API
========================================================== */


/* =========================
        INIT
========================= */

export function initMrSmileState() {

    if (initialized) {
        return;
    }


    initialized = true;


    loadState();


    if (!state.createdAt) {

        state.createdAt =
            now();

        saveState();

    }


    registerListeners();


    console.log(
        "[MR.SMILE STATE] Initialized.",
        clone(state)
    );


    trigger(
        "mrsmile:stateInitialized",
        {

            state:
                clone(state),

            timestamp:
                now()

        }
    );

}


/* =========================
        GET STATE
========================= */

export function getMrSmileState() {

    return clone(
        state
    );

}


/* =========================
        GET VALUE
========================= */

export function getMrSmileStateValue(
    key
) {

    if (
        !Object.prototype.hasOwnProperty.call(
            state,
            key
        )
    ) {

        return undefined;

    }


    return clone(
        state[key]
    );

}


/* =========================
        SET VALUE
========================= */

export function setMrSmileStateValue(
    key,
    value,
    reason = "manual_state_update"
) {

    if (!key) {
        return;
    }


    updateState(

        {

            [key]:
                clone(value)

        },

        reason

    );

}


/* =========================
        RESET
========================= */

export function resetMrSmileState() {

    state =
        createDefaultState();


    saveState();


    trigger(
        "mrsmile:stateReset",
        {

            state:
                clone(state),

            timestamp:
                now()

        }
    );


    console.log(
        "[MR.SMILE STATE] Reset."
    );

}


/* =========================
        CLEAR STORAGE
========================= */

export function clearMrSmileStateStorage() {

    try {

        localStorage.removeItem(
            STORAGE_KEY
        );

    }

    catch (error) {

        console.warn(
            "[MR.SMILE STATE] Failed to clear storage:",
            error
        );

    }

}


/* ==========================================================
   EVENT LISTENERS
========================================================== */

function registerListeners() {


    /* =========================
            OPERATOR
    ========================= */

    on(
        "mrsmile:operatorAction",
        handleOperatorAction
    );


    on(
        "mrsmile:contextCreated",
        handleContextCreated
    );


    /* =========================
            WINDOWS
    ========================= */

    on(
        "mrsmile:operatorAction",
        data => {

            if (!data) {
                return;
            }


            switch (data.type) {

                case "window_open":
                    handleWindowOpen(data);
                    break;

                case "window_close":
                    handleWindowClose(data);
                    break;

                case "window_focus":
                    handleWindowFocus(data);
                    break;

                case "window_move":
                    handleWindowMove(data);
                    break;

            }

        }
    );


    /* =========================
            EXPLORER
    ========================= */

    on(
        "mrsmile:operatorAction",
        data => {

            if (!data) {
                return;
            }


            switch (data.type) {

                case "file_open":
                case "restricted_file":

                    handleFileOpen(data);

                    break;


                case "folder_open":

                    handleFolderOpen(data);

                    break;


                case "folder_close":

                    handleFolderClose(data);

                    break;

            }

        }
    );


    /* =========================
            CONSOLE
    ========================= */

    on(
        "mrsmile:operatorAction",
        data => {

            if (!data) {
                return;
            }


            if (
                data.type ===
                "console_command"
            ) {

                handleConsoleCommand(
                    data
                );

            }

        }
    );


    /* =========================
            CAMERA
    ========================= */

    on(
        "mrsmile:operatorAction",
        data => {

            if (!data) {
                return;
            }


            switch (data.type) {

                case "camera_open":
                case "camera_close":
                case "camera_switch":

                    handleCameraAction(
                        data
                    );

                    break;

            }

        }
    );


    /* =========================
            BEHAVIOR
    ========================= */

    on(
        "mrsmile:behaviorDecision",
        handleBehaviorDecision
    );


    on(
        "mrsmile:actionStarted",
        handleActionStarted
    );

}


/* ==========================================================
   DEBUG API
========================================================== */

window.MRSMILE_STATE = {

    status() {

        return {

            initialized,

            storageKey:
                STORAGE_KEY,

            state:
                getMrSmileState()

        };

    },


    get() {

        return getMrSmileState();

    },


    value(key) {

        return getMrSmileStateValue(
            key
        );

    },


    set(key, value) {

        return setMrSmileStateValue(
            key,
            value,
            "debug_state_update"
        );

    },


    presence(present = true) {

        return setMrSmilePresence(
            present,
            "debug_presence"
        );

    },


    firstContact(accepted = false) {

        return markMrSmileFirstContact(
            accepted
        );

    },


    accept() {

        return acceptMrSmile();

    },


    reset() {

        return resetMrSmileState();

    },


    clearStorage() {

        return clearMrSmileStateStorage();

    }

};


/* ==========================================================
   AUTO INIT
========================================================== */

setTimeout(
    () => {

        initMrSmileState();

    },
    0
);
