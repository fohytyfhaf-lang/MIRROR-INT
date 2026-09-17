/* ==========================================================
   OMEGA CODEX
   Internal Operator Code Reference
========================================================== */

let initialized = false;
let styleLoaded = false;


/* ==========================================================
   CODE DATABASE
========================================================== */

const CODEX_ENTRIES = [

    {
        code: "AUTH-OK",
        category: "AUTH",
        meaning: "Authorization completed successfully."
    },

    {
        code: "AUTH-END",
        category: "AUTH",
        meaning: "Current operator session was closed."
    },


    /* ======================================================
       WINDOWS
    ====================================================== */

    {
        code: "WIN-OPN",
        category: "WINDOW",
        meaning: "Operator opened a system window."
    },

    {
        code: "WIN-CLS",
        category: "WINDOW",
        meaning: "Operator closed a system window."
    },

    {
        code: "WIN-MIN",
        category: "WINDOW",
        meaning: "Operator minimized a system window."
    },

    {
        code: "WIN-RST",
        category: "WINDOW",
        meaning: "Operator restored a system window."
    },

    {
        code: "WIN-MAX",
        category: "WINDOW",
        meaning: "Operator maximized a system window."
    },

    {
        code: "WIN-FCS",
        category: "WINDOW",
        meaning: "Operator focused a system window."
    },

    {
        code: "WIN-MOV",
        category: "WINDOW",
        meaning: "Operator changed a window position."
    },


    /* ======================================================
       CAMERAS
    ====================================================== */

    {
        code: "CAM-IN",
        category: "CAMERA",
        meaning: "Camera monitoring channel opened."
    },

    {
        code: "CAM-SW",
        category: "CAMERA",
        meaning: "Operator changed camera channel."
    },

    {
        code: "CAM-OUT",
        category: "CAMERA",
        meaning: "Camera monitoring channel closed."
    },


    /* ======================================================
       CONSOLE
    ====================================================== */

    {
        code: "CON-CMD",
        category: "CONSOLE",
        meaning: "Console command was executed."
    },


    /* ======================================================
       FILES
    ====================================================== */

    {
        code: "FIL-OPN",
        category: "FILES",
        meaning: "File or document was opened."
    },

    {
        code: "FIL-READ",
        category: "FILES",
        meaning: "File contents were accessed."
    },

    {
        code: "FIL-RES",
        category: "FILES",
        meaning: "Restricted file access was attempted."
    },


    /* ======================================================
       ACCESS
    ====================================================== */

    {
        code: "ACL-DEN",
        category: "ACCESS",
        meaning: "Requested resource or operation was denied."
    },


    /* ======================================================
       COMMUNICATION
    ====================================================== */

    {
        code: "MSG-SND",
        category: "COMMUNICATION",
        meaning: "Internal message was sent."
    },


    /* ======================================================
       MR.SMILE
    ====================================================== */

    {
        code: "MRX-MSG",
        category: "MR.SMILE",
        meaning: "Private communication associated with MR.SMILE."
    },

    {
        code: "MRX-FC",
        category: "MR.SMILE",
        meaning: "First contact with MR.SMILE was registered."
    },


    /* ======================================================
       SYSTEM
    ====================================================== */

    {
        code: "SYS-SET",
        category: "SYSTEM",
        meaning: "Operator system settings were changed."
    },

    {
        code: "SYS-ERR",
        category: "SYSTEM",
        meaning: "A system error was recorded."
    }

];


/* ==========================================================
   HELPERS
========================================================== */

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================================
   STYLE
========================================================== */

function ensureStylesheet() {

    if (
        styleLoaded
    ) {
        return;
    }


    if (
        document.querySelector(
            'link[data-omega-codex="true"]'
        )
    ) {

        styleLoaded =
            true;

        return;

    }


    const link =
        document.createElement(
            "link"
        );


    link.rel =
        "stylesheet";

    link.href =
        "omega/omegaCodeX.css";

    link.dataset.omegaCodex =
        "true";


    document.head.appendChild(
        link
    );


    styleLoaded =
        true;

}


/* ==========================================================
   SIDEBAR BUTTON
========================================================== */

function createCodexButton() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (
        !sidebar
    ) {
        return;
    }


    if (
        document.getElementById(
            "omegaCodexButton"
        )
    ) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "omegaCodexButton";

    button.type =
        "button";


    button.innerHTML = `
        ⌘ <span>OMEGA CODEX</span>
    `;


    button.addEventListener(
        "click",
        () => {

            if (
                typeof window.openApp ===
                "function"
            ) {

                window.openApp(
                    "omegaCodex"
                );

            }

        }
    );


    const activityButton =
        Array
            .from(
                sidebar.querySelectorAll(
                    "button"
                )
            )
            .find(
                button =>
                    button.textContent
                        .toLowerCase()
                        .includes(
                            "activity"
                        )
            );


    if (
        activityButton
    ) {

        activityButton.insertAdjacentElement(
            "afterend",
            button
        );

    } else {

        sidebar.appendChild(
            button
        );

    }

}


/* ==========================================================
   WINDOW
========================================================== */

function createCodexWindow() {

    if (
        document.getElementById(
            "omegaCodexWindow"
        )
    ) {
        return;
    }


    const workspace =
        document.getElementById(
            "workspace"
        );

    if (
        !workspace
    ) {
        return;
    }


    const windowElement =
        document.createElement(
            "div"
        );


    windowElement.id =
        "omegaCodexWindow";

    windowElement.className =
        "window hidden";


    windowElement.innerHTML = `

        <div class="windowHeader">

            <div class="windowTitle">

                <span class="windowIcon">
                    ⌘
                </span>

                <span>
                    OMEGA CODEX
                </span>

            </div>


            <div class="windowControls">

                <button
                    type="button"
                    data-codex-action="minimize"
                >
                    ─
                </button>

                <button
                    type="button"
                    data-codex-action="maximize"
                >
                    □
                </button>

                <button
                    type="button"
                    data-codex-action="close"
                >
                    ✕
                </button>

            </div>

        </div>


        <div class="windowBody omegaCodexBody">

            <div class="omegaCodexIntro">

                <div class="omegaCodexTitle">
                    OPERATOR EVENT REFERENCE
                </div>

                <div class="omegaCodexSubtitle">
                    INTERNAL OMEGA CLASSIFICATION
                </div>

            </div>


            <div class="omegaCodexTools">

                <input
                    id="omegaCodexSearch"
                    type="text"
                    placeholder="SEARCH CODE..."
                    autocomplete="off"
                >


                <select
                    id="omegaCodexFilter"
                >

                    <option value="ALL">
                        ALL CATEGORIES
                    </option>

                    <option value="AUTH">
                        AUTH
                    </option>

                    <option value="WINDOW">
                        WINDOW
                    </option>

                    <option value="CAMERA">
                        CAMERA
                    </option>

                    <option value="CONSOLE">
                        CONSOLE
                    </option>

                    <option value="FILES">
                        FILES
                    </option>

                    <option value="ACCESS">
                        ACCESS
                    </option>

                    <option value="COMMUNICATION">
                        COMMUNICATION
                    </option>

                    <option value="MR.SMILE">
                        MR.SMILE
                    </option>

                    <option value="SYSTEM">
                        SYSTEM
                    </option>

                </select>

            </div>


            <div
                id="omegaCodexList"
                class="omegaCodexList"
            ></div>

        </div>


        <div class="windowStatus">

            <span>
                CODEX STATUS: ACTIVE
            </span>

            <span id="omegaCodexCount">
                0 CODES
            </span>

        </div>

    `;


    workspace.appendChild(
        windowElement
    );


    bindWindowControls();

    renderCodex();

    bindCodexTools();

}


/* ==========================================================
   WINDOW CONTROLS
========================================================== */

function bindWindowControls() {

    const win =
        document.getElementById(
            "omegaCodexWindow"
        );

    if (
        !win
    ) {
        return;
    }


    const minimize =
        win.querySelector(
            '[data-codex-action="minimize"]'
        );

    const maximize =
        win.querySelector(
            '[data-codex-action="maximize"]'
        );

    const close =
        win.querySelector(
            '[data-codex-action="close"]'
        );


    minimize?.addEventListener(
        "click",
        () => {

            window.minimizeWindow?.(
                "omegaCodex"
            );

        }
    );


    maximize?.addEventListener(
        "click",
        () => {

            window.maximizeWindow?.(
                "omegaCodex"
            );

        }
    );


    close?.addEventListener(
        "click",
        () => {

            window.closeApp?.(
                "omegaCodex"
            );

        }
    );

}


/* ==========================================================
   RENDER CODEX
========================================================== */

function renderCodex() {

    const list =
        document.getElementById(
            "omegaCodexList"
        );

    const count =
        document.getElementById(
            "omegaCodexCount"
        );

    const search =
        document.getElementById(
            "omegaCodexSearch"
        );

    const filter =
        document.getElementById(
            "omegaCodexFilter"
        );


    if (
        !list
    ) {
        return;
    }


    const query =
        String(
            search?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const category =
        filter?.value ||
        "ALL";


    const results =
        CODEX_ENTRIES.filter(
            entry => {

                const categoryMatch =
                    category === "ALL" ||
                    entry.category ===
                    category;


                const searchText =
                    `${entry.code} ${entry.category} ${entry.meaning}`
                        .toLowerCase();


                const searchMatch =
                    !query ||
                    searchText.includes(
                        query
                    );


                return (
                    categoryMatch &&
                    searchMatch
                );

            }
        );


    list.innerHTML =
        results
            .map(
                entry => `

                    <div
                        class="omegaCodexEntry"
                        data-category="${escapeHtml(entry.category)}"
                    >

                        <div class="omegaCodexCode">

                            ${escapeHtml(
                                entry.code
                            )}

                        </div>


                        <div class="omegaCodexMain">

                            <div class="omegaCodexMeaning">

                                ${escapeHtml(
                                    entry.meaning
                                )}

                            </div>

                        </div>


                        <div class="omegaCodexCategory">

                            ${escapeHtml(
                                entry.category
                            )}

                        </div>

                    </div>

                `
            )
            .join("");


    if (
        count
    ) {

        count.textContent =
            `${results.length} CODES`;

    }

}


/* ==========================================================
   SEARCH / FILTER
========================================================== */

function bindCodexTools() {

    document
        .getElementById(
            "omegaCodexSearch"
        )
        ?.addEventListener(
            "input",
            renderCodex
        );


    document
        .getElementById(
            "omegaCodexFilter"
        )
        ?.addEventListener(
            "change",
            renderCodex
        );

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initOmegaCodex() {

    if (
        initialized
    ) {
        return;
    }


    initialized =
        true;


    ensureStylesheet();

    createCodexButton();

    createCodexWindow();


    console.log(
        "[OMEGA CODEX] Event reference initialized."
    );

}


window.initOmegaCodex =
    initOmegaCodex;
