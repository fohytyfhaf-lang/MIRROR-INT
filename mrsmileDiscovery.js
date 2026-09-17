/* ==========================================================
   MR.SMILE DISCOVERY
   OMEGA / MIRROR-INT

   PURPOSE
   ----------------------------------------------------------
   Converts hidden discovery conditions into visible
   OMEGA-style system events.

   IMPORTANT:
   - Does NOT activate MR.SMILE by itself at startup.
   - Does NOT spawn eyes.
   - Does NOT play horror audio.
   - Does NOT create random jumpscares.
   - Does NOT use "MR.SMILE DETECTED".
   - Keeps events visually compatible with OMEGA.
   - Uses the official First Contact trigger only.

   PIPELINE

       mrsmileConditions.js
                ↓
       mrsmile:discoveryTrace
                ↓
       OMEGA SYSTEM NOTICE
                ↓
       more operator activity
                ↓
       mrsmile:discoveryReady
                ↓
       PRIVATE / UNREGISTERED CHANNEL
                ↓
       short delay
                ↓
       official First Contact

========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    on,
    trigger
} from "./eventManager.js";

import {
    getMrSmileState
} from "./mrsmileState.js";


/* ==========================================================
   STORAGE
========================================================== */

const STORAGE = {

    firstContact:
        "mrsmile_first_contact",

    discoveryCompleted:
        "mrsmile_discovery_completed",

    lastTrace:
        "mrsmile_last_trace"

};


/* ==========================================================
   CONFIGURATION
========================================================== */

const CONFIG = {

    /*
     * How long normal discovery notices remain visible.
     */
    noticeDuration:
        5200,


    /*
     * Time between multiple notices.
     */
    noticeGap:
        900,


    /*
     * Delay before the private channel
     * is presented.
     */
    channelDelay:
        2200,


    /*
     * Delay between private channel
     * appearance and First Contact.
     */
    firstContactDelay:
        5200,


    /*
     * Maximum number of visible notices
     * at the same time.
     */
    maxVisibleNotices:
        3,


    /*
     * Prevent repeated discovery-ready events.
     */
    readyGuardMs:
        15000

};


/* ==========================================================
   RUNTIME STATE
========================================================== */

const STATE = {

    initialized:
        false,

    discoveryReady:
        false,

    firstContactRunning:
        false,

    firstContactCompleted:
        false,

    channelShown:
        false,

    noticeContainer:
        null,

    notices:
        [],

    lastTraceId:
        null,

    lastReadyTime:
        0,

    contactTimer:
        null,

    channelTimer:
        null

};


/* ==========================================================
   HELPERS
========================================================== */


/* =========================
   NOW
========================= */

function now() {

    return Date.now();

}


/* =========================
   CLEAN TEXT
========================= */

function clean(value) {

    return String(
        value ?? ""
    )
        .trim();

}


/* =========================
   STORAGE GET
========================= */

function storageGet(key) {

    try {

        if (
            typeof localStorage ===
            "undefined"
        ) {

            return null;

        }

        return localStorage.getItem(
            key
        );

    } catch {

        return null;

    }

}


/* =========================
   STORAGE SET
========================= */

function storageSet(
    key,
    value
) {

    try {

        if (
            typeof localStorage ===
            "undefined"
        ) {

            return false;

        }

        localStorage.setItem(
            key,
            String(value)
        );

        return true;

    } catch {

        return false;

    }

}


/* =========================
   STORAGE REMOVE
========================= */

function storageRemove(key) {

    try {

        if (
            typeof localStorage ===
            "undefined"
        ) {

            return false;

        }

        localStorage.removeItem(
            key
        );

        return true;

    } catch {

        return false;

    }

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

    } catch {

        return data;

    }

}


/* ==========================================================
   FIRST CONTACT CHECK
========================================================== */

function isFirstContactCompleted() {

    if (
        storageGet(
            STORAGE.firstContact
        ) === "1"
    ) {

        return true;

    }


    try {

        const state =
            getMrSmileState();


        if (
            state?.firstContact ===
            true
        ) {

            return true;

        }


        if (
            state?.accepted ===
            true
        ) {

            return true;

        }

    } catch {
        /* ignore */
    }


    return false;

}


/* ==========================================================
   DOM HELPERS
========================================================== */


/* =========================
   GET
========================= */

function get(id) {

    return document.getElementById(
        id
    );

}


/* =========================
   CREATE CONTAINER
========================= */

function createNoticeContainer() {

    if (
        STATE.noticeContainer &&
        document.body.contains(
            STATE.noticeContainer
        )
    ) {

        return STATE.noticeContainer;

    }


    const existing =
        get(
            "omegaDiscoveryLayer"
        );


    if (
        existing
    ) {

        STATE.noticeContainer =
            existing;

        return existing;

    }


    const container =
        document.createElement(
            "div"
        );


    container.id =
        "omegaDiscoveryLayer";


    container.className =
        "omegaDiscoveryLayer";


    /*
     * The CSS file controls the visual style.
     * These values are only fallback values
     * so the system remains usable even before
     * the stylesheet loads.
     */

    container.style.position =
        "fixed";

    container.style.top =
        "20px";

    container.style.right =
        "20px";

    container.style.width =
        "min(420px, calc(100vw - 40px))";

    container.style.zIndex =
        "2147483000";

    container.style.pointerEvents =
        "none";


    document.body.appendChild(
        container
    );


    STATE.noticeContainer =
        container;


    return container;

}


/* =========================
   SAFE HTML
========================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )

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
   NOTICE TYPES
========================================================== */

const TRACE_CLASS = {

    common:
        "normal",

    rare:
        "attention",

    very_rare:
        "critical"

};


/* ==========================================================
   TRACE NORMALIZATION
========================================================== */

function normalizeTrace(
    data = {}
) {

    return {

        id:
            clean(
                data.id ||
                "SYS-00"
            ),

        category:
            clean(
                data.category ||
                "system"
            ),

        rarity:
            clean(
                data.rarity ||
                "common"
            ),

        title:
            clean(
                data.title ||
                "OMEGA MONITOR"
            ),

        message:
            clean(
                data.message ||
                "System activity requires review."
            ),

        detail:
            clean(
                data.detail ||
                ""
            ),

        duration:
            Number(
                data.duration
            ) > 0

                ? Number(
                    data.duration
                )

                : CONFIG.noticeDuration

    };

}


/* ==========================================================
   NOTICE ICON
========================================================== */

function getNoticeMarker(
    rarity
) {

    switch (
        rarity
    ) {

        case "very_rare":
            return "[!]";

        case "rare":
            return "[•]";

        default:
            return "[·]";

    }

}


/* ==========================================================
   CREATE NOTICE
========================================================== */

function createTraceNotice(
    trace
) {

    const container =
        createNoticeContainer();


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "omegaDiscoveryNotice " +
        (
            TRACE_CLASS[
                trace.rarity
            ] ||
            "normal"
        );


    element.dataset.traceId =
        trace.id;


    const timestamp =
        new Date()
            .toLocaleTimeString(
                [],
                {
                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit"
                }
            );


    element.innerHTML = `

        <div class="omegaDiscoveryHeader">

            <span class="omegaDiscoveryMarker">
                ${escapeHtml(
                    getNoticeMarker(
                        trace.rarity
                    )
                )}
            </span>

            <span class="omegaDiscoveryTitle">
                ${escapeHtml(
                    trace.title
                )}
            </span>

            <span class="omegaDiscoveryTime">
                ${escapeHtml(
                    timestamp
                )}
            </span>

        </div>


        <div class="omegaDiscoveryMessage">

            ${escapeHtml(
                trace.message
            )}

        </div>


        ${
            trace.detail
                ? `
                    <div class="omegaDiscoveryDetail">

                        ${escapeHtml(
                            trace.detail
                        )}

                    </div>
                `
                : ""
        }

    `;


    container.appendChild(
        element
    );


    STATE.notices.push(
        element
    );


    /*
     * Limit visible notices.
     */

    while (
        STATE.notices.length >
        CONFIG.maxVisibleNotices
    ) {

        const oldest =
            STATE.notices.shift();


        if (
            oldest &&
            oldest.parentNode
        ) {

            oldest.parentNode.removeChild(
                oldest
            );

        }

    }


    /*
     * Animation start.
     */

    requestAnimationFrame(
        () => {

            element.classList.add(
                "visible"
            );

        }
    );


    /*
     * Remove automatically.
     */

    const duration =
        Math.max(
            1000,
            trace.duration
        );


    setTimeout(
        () => {

            removeNotice(
                element
            );

        },
        duration
    );


    return element;

}


/* ==========================================================
   REMOVE NOTICE
========================================================== */

function removeNotice(
    element
) {

    if (
        !element
    ) {

        return;

    }


    element.classList.remove(
        "visible"
    );


    element.classList.add(
        "closing"
    );


    setTimeout(
        () => {

            if (
                element.parentNode
            ) {

                element.parentNode.removeChild(
                    element
                );

            }


            const index =
                STATE.notices.indexOf(
                    element
                );


            if (
                index !== -1
            ) {

                STATE.notices.splice(
                    index,
                    1
                );

            }

        },
        450
    );

}


/* ==========================================================
   SHOW DISCOVERY TRACE
========================================================== */

function showDiscoveryTrace(
    data = {}
) {

    const trace =
        normalizeTrace(
            data
        );


    /*
     * Prevent the exact same trace
     * from appearing repeatedly.
     */

    if (
        STATE.lastTraceId ===
        trace.id
    ) {

        return false;

    }


    STATE.lastTraceId =
        trace.id;


    storageSet(
        STORAGE.lastTrace,
        trace.id
    );


    createTraceNotice(
        trace
    );


    trigger(
        "mrsmile:discoveryTraceDisplayed",
        {

            trace:
                clone(trace),

            timestamp:
                now()

        }
    );


    return true;

}


/* ==========================================================
   SPECIAL PRIVATE CHANNEL
========================================================== */

function createPrivateChannelNotice() {

    if (
        STATE.channelShown
    ) {

        return false;

    }


    STATE.channelShown =
        true;


    const container =
        createNoticeContainer();


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "omegaDiscoveryNotice " +
        "private-channel";


    element.dataset.type =
        "unregistered-channel";


    const timestamp =
        new Date()
            .toLocaleTimeString(
                [],
                {
                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit"
                }
            );


    element.innerHTML = `

        <div class="omegaDiscoveryHeader">

            <span class="omegaDiscoveryMarker">
                [!]
            </span>

            <span class="omegaDiscoveryTitle">
                COMMUNICATION MONITOR
            </span>

            <span class="omegaDiscoveryTime">
                ${escapeHtml(
                    timestamp
                )}
            </span>

        </div>


        <div class="omegaDiscoveryMessage">

            A private communication endpoint
            was detected outside the current
            operator session.

        </div>


        <div class="omegaDiscoveryDetail">

            CHANNEL:
            UNREGISTERED

        </div>


        <div class="omegaDiscoveryStatus">

            STATUS:
            PENDING IDENTIFICATION

        </div>

    `;


    container.appendChild(
        element
    );


    STATE.notices.push(
        element
    );


    requestAnimationFrame(
        () => {

            element.classList.add(
                "visible"
            );

        }
    );


    trigger(
        "mrsmile:unregisteredChannelDetected",
        {

            channel:
                "private",

            source:
                "omega_discovery",

            timestamp:
                now()

        }
    );


    /*
     * The message remains visible
     * while First Contact is prepared.
     */

    return element;

}


/* ==========================================================
   PREPARE FIRST CONTACT
========================================================== */

function prepareFirstContact() {

    if (
        STATE.firstContactRunning
    ) {

        return false;

    }


    if (
        STATE.firstContactCompleted
    ) {

        return false;

    }


    if (
        isFirstContactCompleted()
    ) {

        STATE.firstContactCompleted =
            true;

        return false;

    }


    if (
        STATE.contactTimer
    ) {

        return false;

    }


    STATE.firstContactRunning =
        true;


    /*
     * Show final channel notice after
     * the discovery layer has settled.
     */

    STATE.channelTimer =
        setTimeout(
            () => {

                STATE.channelTimer =
                    null;


                createPrivateChannelNotice();


            },
            CONFIG.channelDelay
        );


    STATE.contactTimer =
        setTimeout(
            () => {

                STATE.contactTimer =
                    null;


                startOfficialFirstContact();

            },
            CONFIG.channelDelay +
            CONFIG.firstContactDelay
        );


    return true;

}


/* ==========================================================
   OFFICIAL FIRST CONTACT
========================================================== */

function startOfficialFirstContact() {

    if (
        STATE.firstContactCompleted
    ) {

        return false;

    }


    if (
        isFirstContactCompleted()
    ) {

        STATE.firstContactCompleted =
            true;

        STATE.firstContactRunning =
            false;

        return false;

    }


    /*
     * Only the official event path
     * is allowed to start First Contact.
     */

    trigger(
        "mrsmile:discoveryContactReady",
        {

            source:
                "omega_discovery",

            reason:
                "unregistered_channel_established",

            timestamp:
                now()

        }
    );


    /*
     * mrsmileEvents.js owns the actual
     * First Contact sequence.
     */

    if (
        typeof window !==
        "undefined" &&
        typeof window.triggerMrSmileFirstContact ===
        "function"
    ) {

        const started =
            window.triggerMrSmileFirstContact({

                source:
                    "discovery_system",

                type:
                    "first_contact_discovered"

            });


        if (
            started ===
            false
        ) {

            STATE.firstContactRunning =
                false;

            return false;

        }


        return true;

    }


    /*
     * Fallback:
     *
     * The official orchestrator normally
     * exposes the API above.
     *
     * We intentionally do NOT activate
     * MR.SMILE directly here.
     */

    console.warn(
        "[MR.SMILE DISCOVERY] Official First Contact API unavailable."
    );


    STATE.firstContactRunning =
        false;


    return false;

}


/* ==========================================================
   FIRST CONTACT COMPLETED
========================================================== */

function handleFirstContactCompleted() {

    STATE.firstContactCompleted =
        true;


    STATE.firstContactRunning =
        false;


    storageSet(
        STORAGE.discoveryCompleted,
        "1"
    );


    /*
     * Clear pending timers.
     */

    if (
        STATE.contactTimer
    ) {

        clearTimeout(
            STATE.contactTimer
        );

        STATE.contactTimer =
            null;

    }


    if (
        STATE.channelTimer
    ) {

        clearTimeout(
            STATE.channelTimer
        );

        STATE.channelTimer =
            null;

    }


    trigger(
        "mrsmile:discoveryCompleted",
        {

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   DISCOVERY READY
========================================================== */

function handleDiscoveryReady(
    data = {}
) {

    if (
        STATE.firstContactCompleted
    ) {

        return;

    }


    if (
        isFirstContactCompleted()
    ) {

        STATE.firstContactCompleted =
            true;

        return;

    }


    const current =
        now();


    /*
     * Guard against duplicate ready events.
     */

    if (
        current -
            STATE.lastReadyTime <
        CONFIG.readyGuardMs
    ) {

        return;

    }


    STATE.lastReadyTime =
        current;


    STATE.discoveryReady =
        true;


    trigger(
        "mrsmile:discoverySequenceStarted",
        {

            route:
                data.route ||
                "unknown",

            traces:
                clone(
                    data.traces ||
                    []
                ),

            timestamp:
                now()

        }
    );


    /*
     * Do not instantly call First Contact.
     *
     * The system first has to visibly
     * discover the communication endpoint.
     */

    prepareFirstContact();

}


/* ==========================================================
   DISCOVERY RESET
========================================================== */

export function resetMrSmileDiscovery() {

    if (
        STATE.contactTimer
    ) {

        clearTimeout(
            STATE.contactTimer
        );

        STATE.contactTimer =
            null;

    }


    if (
        STATE.channelTimer
    ) {

        clearTimeout(
            STATE.channelTimer
        );

        STATE.channelTimer =
            null;

    }


    STATE.discoveryReady =
        false;

    STATE.firstContactRunning =
        false;

    STATE.firstContactCompleted =
        false;

    STATE.channelShown =
        false;

    STATE.lastTraceId =
        null;

    STATE.lastReadyTime =
        0;


    if (
        STATE.noticeContainer
    ) {

        STATE.noticeContainer.innerHTML =
            "";

    }


    STATE.notices =
        [];


    storageRemove(
        STORAGE.discoveryCompleted
    );

    storageRemove(
        STORAGE.lastTrace
    );


    trigger(
        "mrsmile:discoveryReset",
        {

            timestamp:
                now()

        }
    );


    console.log(
        "[MR.SMILE DISCOVERY] Reset."
    );


    return true;

}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileDiscoveryStatus() {

    return {

        initialized:
            STATE.initialized,

        discoveryReady:
            STATE.discoveryReady,

        firstContactRunning:
            STATE.firstContactRunning,

        firstContactCompleted:
            STATE.firstContactCompleted,

        channelShown:
            STATE.channelShown,

        lastTraceId:
            STATE.lastTraceId,

        visibleNotices:
            STATE.notices.length

    };

}


/* ==========================================================
   GLOBAL API
========================================================== */

function exposeGlobalAPI() {

    if (
        typeof window ===
        "undefined"
    ) {

        return;

    }


    window.getMrSmileDiscoveryStatus =
        getMrSmileDiscoveryStatus;


    window.resetMrSmileDiscovery =
        resetMrSmileDiscovery;


    window.MRSMILE_DISCOVERY = {

        status:
            getMrSmileDiscoveryStatus,

        reset:
            resetMrSmileDiscovery

    };

}


/* ==========================================================
   EVENT LISTENERS
========================================================== */

function registerListeners() {

    /*
     * Hidden condition engine produced
     * a visible discovery trace.
     */

    on(
        "mrsmile:discoveryTrace",
        showDiscoveryTrace
    );


    /*
     * All conditions have been satisfied.
     */

    on(
        "mrsmile:discoveryReady",
        handleDiscoveryReady
    );


    /*
     * Official First Contact finished.
     */

    on(
        "mrsmile:firstContactCompleted",
        handleFirstContactCompleted
    );


    /*
     * Development reset.
     */

    on(
        "mrsmile:conditionsReset",
        () => {

            /*
             * We intentionally don't reset
             * the discovery UI here automatically.
             *
             * A complete reset should be explicit
             * through resetMrSmileDiscovery().
             */

        }
    );

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileDiscovery() {

    if (
        STATE.initialized
    ) {

        return;

    }


    STATE.initialized =
        true;


    /*
     * Existing completed contact means
     * discovery must remain inactive.
     */

    if (
        isFirstContactCompleted()
    ) {

        STATE.firstContactCompleted =
            true;

        storageSet(
            STORAGE.discoveryCompleted,
            "1"
        );

    }


    registerListeners();

    exposeGlobalAPI();


    console.log(
        "[MR.SMILE DISCOVERY] Discovery presentation layer initialized."
    );

}


/* ==========================================================
   DOM READY
========================================================== */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        initMrSmileDiscovery();

    }
);
