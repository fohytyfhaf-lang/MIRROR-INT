
/* =========================================================
   ABIC MEMBER ACCESS
   Public registration + hidden progression
========================================================= */

import { createLocalAccount } from "../login.js";


/* =========================================================
   CONFIG
========================================================= */

const STORAGE_KEY = "abic_member_access_v1";

const STATE_VERSION = 3;

const REQUIRED_ARCHIVES = 3;


/* =========================================================
   DEFAULT STATE
========================================================= */

function getDefaultState() {
    return {
        version: STATE_VERSION,

        accountCreated: false,

        username: "",
        email: "",

        displayName: "",
        region: "",
        interests: "",

        profileComplete: false,

        openedArchives: [],

        restrictedOpened: false,

        returnToAccount: false,

       transitionStarted: false,

       omegaUnlocked: false,
       interfaceMode: "abic",

       createdAt: null
    };
}


/* =========================================================
   STORAGE
========================================================= */

function getState() {

    const defaults = getDefaultState();

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return defaults;
        }

        const parsed =
            JSON.parse(saved);

        if (
            !parsed ||
            typeof parsed !== "object"
        ) {
            return defaults;
        }

        const state = {
            ...defaults,
            ...parsed
        };


        /*
         * Make sure archive data is always valid.
         */

        if (
            !Array.isArray(
                state.openedArchives
            )
        ) {
            state.openedArchives = [];
        }


        /*
         * Remove duplicate archive IDs.
         */

        state.openedArchives =
            [...new Set(
                state.openedArchives
                    .filter(Boolean)
                    .map(String)
            )];


        /*
         * State migration.
         */

        if (
            !Number.isFinite(
                state.version
            ) ||
            state.version < STATE_VERSION
        ) {
            state.version = STATE_VERSION;
        }

       if (state.transitionStarted === true) {
           state.omegaUnlocked = true;
       }

      if (
           state.interfaceMode !== "abic" &&
          state.interfaceMode !== "omega"
       ) {
          state.interfaceMode =
             state.omegaUnlocked
                 ? "omega"
                 : "abic";
         }

if (state.omegaUnlocked !== true) {
    state.interfaceMode = "abic";
}


        return state;

    } catch (error) {

        console.warn(
            "[ABIC MEMBER] Failed to read saved state:",
            error
        );

        return defaults;
    }
}


function saveState(state) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

        return true;

    } catch (error) {

        console.error(
            "[ABIC MEMBER] Failed to save state:",
            error
        );

        return false;
    }
}


export function getAbicMemberState() {
    return getState();
}


/* =========================================================
   ACCOUNT ACCESS STATUS
========================================================= */

/*
 * This function is intentionally exported so core.js
 * can later determine whether the hidden service has
 * already been unlocked.
 */
export function isAbicOmegaUnlocked() {
    const state = getState();

    return (
        state.omegaUnlocked === true ||
        state.transitionStarted === true
    );
}

export function getInterfaceMode() {
    const state = getState();

    if (!isAbicOmegaUnlocked()) {
        return "abic";
    }

    return state.interfaceMode === "omega"
        ? "omega"
        : "abic";
}


export function setInterfaceMode(mode) {
    const state = getState();

    if (!isAbicOmegaUnlocked()) {
        return false;
    }

    if (
        mode !== "abic" &&
        mode !== "omega"
    ) {
        return false;
    }

    state.interfaceMode = mode;

    saveState(state);

    return true;
}


export function returnToAbic() {
    if (!isAbicOmegaUnlocked()) {
        return false;
    }

    const state = getState();

    state.interfaceMode = "abic";

    saveState(state);

    const publicSite =
        document.getElementById("publicSite");

    const login =
        document.getElementById("loginScreen");

    const desktop =
        document.getElementById("desktop");

    publicSite?.classList.remove("hidden");
    login?.classList.add("hidden");
    desktop?.classList.add("hidden");

    window.dispatchEvent(
        new CustomEvent("abic:returnToPublic")
    );

    return true;
}


export function returnToOmega() {
    if (!isAbicOmegaUnlocked()) {
        return false;
    }

    const state = getState();

    state.interfaceMode = "omega";

    saveState(state);

    const publicSite =
        document.getElementById("publicSite");

    const login =
        document.getElementById("loginScreen");

    const desktop =
        document.getElementById("desktop");

    publicSite?.classList.add("hidden");
    desktop?.classList.add("hidden");
    login?.classList.remove("hidden");

   window.dispatchEvent(
    new CustomEvent("abic:returnToOmega")
);

    return true;
}


/* =========================================================
   ARCHIVE PROGRESSION
========================================================= */

export function recordArchiveOpen(
    recordId,
    restricted = false
) {

    if (!recordId) {
        return;
    }


    const state = getState();


    /*
     * Do not allow archive progression before
     * an ABIC account has been created.
     */

    if (!state.accountCreated) {
        return;
    }


    if (
        !Array.isArray(
            state.openedArchives
        )
    ) {
        state.openedArchives = [];
    }


    const normalizedId =
        String(recordId);


    /*
     * Only count an archive once.
     */

    if (
        !state.openedArchives.includes(
            normalizedId
        )
    ) {

        state.openedArchives.push(
            normalizedId
        );
    }


    /*
     * Restricted documents are tracked
     * independently from the archive count.
     */

    if (restricted === true) {
        state.restrictedOpened = true;
    }


    saveState(state);

    refreshAccountRequirements();
}


function getArchiveCount(state) {

    if (
        !state ||
        !Array.isArray(
            state.openedArchives
        )
    ) {
        return 0;
    }

    return state.openedArchives.length;
}


/* =========================================================
   REQUIREMENT CHECKS
========================================================= */

function isReadyForReturn(state) {

    if (!state) {
        return false;
    }

    return (
        state.accountCreated === true &&

        getArchiveCount(state) >=
            REQUIRED_ARCHIVES &&

        state.restrictedOpened === true &&

        state.profileComplete === true
    );
}


/* =========================================================
   MEMBER ACCESS PAGE
========================================================= */

export function openMemberAccess() {

    const content =
        document.getElementById(
            "publicContent"
        );

    if (!content) {
        return;
    }


    const state = getState();


    content.innerHTML = `

        <section class="abicMemberPage">

            <header class="abicMemberHeader">

                <div class="abicMemberEyebrow">
                    ABIC MEMBER SERVICES
                </div>

                <h1>
                    Member Access
                </h1>

                <p>
                    Register for access to selected
                    ABIC research and archive services.
                </p>

            </header>


            <div
                id="abicMemberBody"
                class="abicMemberBody"
            ></div>

        </section>
    `;


    renderAccountBody(state);
}


/* =========================================================
   ACCOUNT BODY
========================================================= */

function renderAccountBody(state) {

    const body =
        document.getElementById(
            "abicMemberBody"
        );

    if (!body) {
        return;
    }


    /*
     * No account yet.
     */

    if (!state.accountCreated) {

        renderRegistrationForm(
            body
        );

        return;
    }

   if (isAbicOmegaUnlocked()) {
    renderUnlockedAccount(state);
    return;
}
   


    /*
     * Existing ABIC account.
     */

    renderRegisteredAccount(
        state
    );
}


/* =========================================================
   REGISTRATION FORM
========================================================= */

function renderRegistrationForm(body) {

    body.innerHTML = `

        <div class="abicMemberCard">

            <div class="abicMemberCardLabel">
                PUBLIC ACCOUNT
            </div>

            <h2>
                Create an ABIC account
            </h2>

            <p>
                Registration is currently available
                for archive and research services.
            </p>


            <form id="abicRegistrationForm">

                <label>
                    Username

                    <input
                        id="abicRegisterUsername"
                        type="text"
                        maxlength="32"
                        autocomplete="username"
                        required
                    >
                </label>


                <label>
                    Email

                    <input
                        id="abicRegisterEmail"
                        type="email"
                        maxlength="120"
                        autocomplete="email"
                        required
                    >
                </label>


                <label>
                    Password

                    <input
                        id="abicRegisterPassword"
                        type="password"
                        minlength="6"
                        autocomplete="new-password"
                        required
                    >
                </label>


                <label>
                    Confirm password

                    <input
                        id="abicRegisterPasswordConfirm"
                        type="password"
                        minlength="6"
                        autocomplete="new-password"
                        required
                    >
                </label>


                <div
                    id="abicRegistrationError"
                    class="abicMemberError hidden"
                ></div>


                <button
                    type="submit"
                    class="abicMemberButton"
                >
                    Create account
                </button>

            </form>

        </div>
    `;


    initRegistrationForm();
}


/* =========================================================
   REGISTERED ACCOUNT
========================================================= */
function renderUnlockedAccount(state) {

    const body =
        document.getElementById("abicMemberBody");

    if (!body) return;

    body.innerHTML = `
        <section class="abicMemberCard">

            <div class="abicMemberCardLabel">
                MEMBER ACCOUNT
            </div>

            <h2>
                ${escapeHTML(
                    state.displayName ||
                    state.username
                )}
            </h2>

            <p>
                Your ABIC account remains active.
            </p>

            <div
                class="abicMemberCardLabel"
                style="margin-top:24px;"
            >
                INTERNAL ACCESS
            </div>

            <p>
                Additional network access is enabled.
            </p>

            <button
                id="abicReturnToOmega"
                type="button"
                class="abicMemberButton"
            >
                Return to OMEGA
            </button>

        </section>
    `;

    document
        .getElementById("abicReturnToOmega")
        ?.addEventListener(
            "click",
            returnToOmega
        );
}


function renderRegisteredAccount(state) {

    const body =
        document.getElementById(
            "abicMemberBody"
        );

    if (!body) {
        return;
    }


    const archiveCount =
        getArchiveCount(state);


    const archiveDone =
        archiveCount >=
        REQUIRED_ARCHIVES;


    const restrictedDone =
        state.restrictedOpened === true;


    const profileDone =
        state.profileComplete === true;


    const returnDone =
        state.returnToAccount === true;


    body.innerHTML = `

        <div class="abicMemberGrid">

            <section class="abicMemberCard">

                <div class="abicMemberCardLabel">
                    ACCOUNT
                </div>

                <h2>
                    ${escapeHTML(
                        state.displayName ||
                        state.username
                    )}
                </h2>

                <p>
                    Your public account service
                    is currently unavailable.
                </p>


                <div class="abicMemberAccountInfo">

                    <div>
                        <span>
                            Username
                        </span>

                        <strong>
                            ${escapeHTML(
                                state.username
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Email
                        </span>

                        <strong>
                            ${escapeHTML(
                                state.email
                            )}
                        </strong>
                    </div>

                </div>

            </section>


            <section class="abicMemberCard">

                <div class="abicMemberCardLabel">
                    ACCOUNT STATUS
                </div>

                <p>
                    Your registration information
                    has been retained.
                </p>


                <div
                    id="abicRequirementList"
                    class="abicRequirementList"
                >

                    ${requirementHTML(
                        state.accountCreated,
                        "Account registration"
                    )}


                    ${requirementHTML(
                        archiveDone,
                        `Open ${REQUIRED_ARCHIVES} archive records`
                    )}


                    ${requirementHTML(
                        restrictedDone,
                        "Read 1 restricted document"
                    )}


                    ${requirementHTML(
                        profileDone,
                        "Complete your profile"
                    )}


                    ${requirementHTML(
                        returnDone,
                        "Return to the account page"
                    )}

                </div>

            </section>

        </div>


        <section class="abicMemberCard">

            <div class="abicMemberCardLabel">
                PROFILE
            </div>

            <h2>
                Research Profile
            </h2>

            <p>
                Complete the public profile associated
                with your account.
            </p>


            <form id="abicProfileForm">

                <label>
                    Display name

                    <input
                        id="abicProfileName"
                        type="text"
                        maxlength="60"
                        value="${escapeAttribute(
                            state.displayName
                        )}"
                        required
                    >
                </label>


                <label>
                    Preferred region

                    <input
                        id="abicProfileRegion"
                        type="text"
                        maxlength="80"
                        value="${escapeAttribute(
                            state.region
                        )}"
                        placeholder="e.g. Northeast"
                        required
                    >
                </label>


                <label>
                    Research interests

                    <textarea
                        id="abicProfileInterests"
                        maxlength="300"
                        required
                    >${escapeHTML(
                        state.interests
                    )}</textarea>
                </label>


                <button
                    type="submit"
                    class="abicMemberButton"
                >
                    Save profile
                </button>

            </form>

        </section>

    `;


    initProfileForm();


    /*
     * IMPORTANT:
     *
     * Registration itself NEVER reaches this block
     * with completed progression.
     *
     * The fifth requirement is completed only when
     * the player opens Member Access again after
     * completing the previous four requirements.
     */

    if (
        isReadyForReturn(state) &&
        !state.returnToAccount &&
        !state.transitionStarted
    ) {

        state.returnToAccount = true;

        saveState(state);

        refreshAccountRequirements();


        /*
         * Small delay so the player can actually see
         * the fifth requirement become completed.
         */

        setTimeout(
            () => {

                const latestState =
                    getState();


                if (
                    latestState.transitionStarted
                ) {
                    return;
                }


                if (
                    !isReadyForReturn(
                        latestState
                    )
                ) {
                    return;
                }


                startTransition();

            },
            650
        );
    }
}


/* =========================================================
   REGISTRATION
========================================================= */

function initRegistrationForm() {

    const form =
        document.getElementById(
            "abicRegistrationForm"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            createAccount();
        }
    );
}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

function createAccount() {

    const usernameInput =
        document.getElementById(
            "abicRegisterUsername"
        );


    const emailInput =
        document.getElementById(
            "abicRegisterEmail"
        );


    const passwordInput =
        document.getElementById(
            "abicRegisterPassword"
        );


    const confirmInput =
        document.getElementById(
            "abicRegisterPasswordConfirm"
        );


    const error =
        document.getElementById(
            "abicRegistrationError"
        );


    if (
        !usernameInput ||
        !emailInput ||
        !passwordInput ||
        !confirmInput
    ) {
        return;
    }


    const username =
        usernameInput.value.trim();


    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


    const confirm =
        confirmInput.value;


    /* ---------------------------------------------
       BASIC VALIDATION
    --------------------------------------------- */

    if (
        !username ||
        !email ||
        !password ||
        !confirm
    ) {

        showRegistrationError(
            error,
            "Please complete all required fields."
        );

        return;
    }


    if (
        !username.match(
            /^[A-Za-z0-9_.-]+$/
        )
    ) {

        showRegistrationError(
            error,
            "Username may contain only letters, numbers, dots, underscores and hyphens."
        );

        return;
    }


    if (
        password !== confirm
    ) {

        showRegistrationError(
            error,
            "Passwords do not match."
        );

        return;
    }


    if (
        password.length < 6
    ) {

        showRegistrationError(
            error,
            "Password must contain at least 6 characters."
        );

        return;
    }


    /*
     * Do not allow a second ABIC account to be
     * created through this page.
     */

    const existingState =
        getState();


    if (
        existingState.accountCreated
    ) {

        renderAccountBody(
            existingState
        );

        return;
    }


    /* ---------------------------------------------
       CREATE REAL LOCAL OMEGA ACCOUNT
    --------------------------------------------- */

    let result;


    try {

        result =
            createLocalAccount(
                username,
                password
            );

    } catch (accountError) {

        console.error(
            "[ABIC MEMBER] Account creation failed:",
            accountError
        );


        showRegistrationError(
            error,
            accountError?.message ||
            "The account could not be created."
        );

        return;
    }


    /*
     * login.js returns:
     *
     * {
     *     ok: true,
     *     username,
     *     operatorId,
     *     ...
     * }
     *
     * Therefore result.ok must be checked.
     */

    if (
        !result ||
        result.ok !== true
    ) {

        let message =
            "The account could not be created.";


        switch (
            result?.reason
        ) {

            case "invalid_username":

                message =
                    "Please enter a username.";

                break;


            case "invalid_username_format":

                message =
                    "Username may contain only letters, numbers, dots, underscores and hyphens.";

                break;


            case "account_exists":

                message =
                    "This username is already registered.";

                break;


            case "storage_failed":

                message =
                    "The account could not be saved.";

                break;


            case "invalid_password":

                message =
                    "Please enter a valid password.";

                break;
        }


        showRegistrationError(
            error,
            message
        );

        return;
    }


    /* ---------------------------------------------
       NEW PROGRESSION STATE
    --------------------------------------------- */

    /*
     * IMPORTANT:
     *
     * Start with a completely fresh progression.
     *
     * We do NOT merge an old progression here.
     */

    const state =
        getDefaultState();


    state.accountCreated = true;

    state.username =
        username;

    state.email =
        email;

    state.createdAt =
        Date.now();


    const saved =
        saveState(state);


    if (!saved) {

        showRegistrationError(
            error,
            "The account was created, but the registration state could not be saved. Please do not continue yet."
        );

        return;
    }


    /*
     * Registration ends here.
     *
     * NO transition.
     * NO OMEGA login.
     * NO hidden redirect.
     */

    renderAccountBody(
        state
    );
}


/* =========================================================
   PROFILE
========================================================= */

function initProfileForm() {

    const form =
        document.getElementById(
            "abicProfileForm"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const state =
                getState();


            if (
                !state.accountCreated
            ) {
                return;
            }


            const name =
                document
                    .getElementById(
                        "abicProfileName"
                    )
                    ?.value
                    .trim();


            const region =
                document
                    .getElementById(
                        "abicProfileRegion"
                    )
                    ?.value
                    .trim();


            const interests =
                document
                    .getElementById(
                        "abicProfileInterests"
                    )
                    ?.value
                    .trim();


            if (
                !name ||
                !region ||
                !interests
            ) {
                return;
            }


            state.displayName =
                name;


            state.region =
                region;


            state.interests =
                interests;


            state.profileComplete =
                true;


            /*
             * Completing the profile does NOT
             * trigger the transition.
             */

            state.returnToAccount =
                false;


            saveState(state);


            renderAccountBody(
                state
            );
        }
    );
}


/* =========================================================
   REQUIREMENTS UI
========================================================= */

function refreshAccountRequirements() {

    const state =
        getState();


    const list =
        document.getElementById(
            "abicRequirementList"
        );


    if (!list) {
        return;
    }


    const archiveCount =
        getArchiveCount(state);


    list.innerHTML = `

        ${requirementHTML(
            state.accountCreated,
            "Account registration"
        )}


        ${requirementHTML(
            archiveCount >= REQUIRED_ARCHIVES,
            `Open ${REQUIRED_ARCHIVES} archive records`
        )}


        ${requirementHTML(
            state.restrictedOpened,
            "Read 1 restricted document"
        )}


        ${requirementHTML(
            state.profileComplete,
            "Complete your profile"
        )}


        ${requirementHTML(
            state.returnToAccount,
            "Return to the account page"
        )}

    `;
}


function requirementHTML(
    completed,
    text
) {

    return `
        <div class="abicRequirement ${
            completed
                ? "isComplete"
                : ""
        }">

            <span class="abicRequirementMark">
                ${
                    completed
                        ? "✓"
                        : "○"
                }
            </span>

            <span>
                ${escapeHTML(text)}
            </span>

        </div>
    `;
}


/* =========================================================
   TRANSITION
========================================================= */

function startTransition() {

    const state =
        getState();


    /*
     * Never start twice.
     */

    if (
        state.transitionStarted
    ) {
        return;
    }


    /*
     * Never start without every requirement.
     */

    if (
        !isReadyForReturn(state)
    ) {
        return;
    }


    /*
     * Mark the service as unlocked only
     * immediately before the transition.
     */

    state.transitionStarted = true;
   state.omegaUnlocked = true;
  state.interfaceMode = "omega";


    saveState(state);


    const existing =
        document.getElementById(
            "abicServiceTransition"
        );


    if (existing) {
        existing.remove();
    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "abicServiceTransition";


    overlay.innerHTML = `

        <div class="abicTransitionPanel">

            <div class="abicTransitionSmall">
                ACCOUNT VERIFICATION
            </div>

            <div class="abicTransitionTitle">
                Verification complete.
            </div>

            <div class="abicTransitionStatus">
                Please remain on this page.
            </div>

            <div class="abicTransitionBar">
                <span></span>
            </div>

        </div>
    `;


    document.body.appendChild(
        overlay
    );


    requestAnimationFrame(
        () => {

            overlay.classList.add(
                "isActive"
            );
        }
    );


    setTimeout(
        () => {

            overlay.classList.add(
                "isProcessing"
            );

        },
        900
    );


    setTimeout(
        () => {

            overlay.classList.add(
                "isFinalizing"
            );

        },
        1600
    );


    setTimeout(
        () => {

            const publicSite =
                document.getElementById(
                    "publicSite"
                );


            const login =
                document.getElementById(
                    "loginScreen"
                );


            const desktop =
                document.getElementById(
                    "desktop"
                );


            if (publicSite) {

                publicSite.classList.add(
                    "hidden"
                );
            }


            if (desktop) {

                desktop.classList.add(
                    "hidden"
                );
            }


            if (login) {

                login.classList.remove(
                    "hidden"
                );
            }


            overlay.remove();

        },
        2400
    );
}


/* =========================================================
   TEST RESET
========================================================= */

export function resetAbicMemberTransitionForTesting() {

    const state =
        getDefaultState();


    saveState(state);


    const overlay =
        document.getElementById(
            "abicServiceTransition"
        );


    if (overlay) {
        overlay.remove();
    }
}


/* =========================================================
   ARCHIVE EVENT BRIDGE
========================================================= */

window.addEventListener(
    "abic:archiveOpened",
    event => {

        const recordId =
            event.detail?.recordId;


        const restricted =
            event.detail?.restricted === true;


        recordArchiveOpen(
            recordId,
            restricted
        );
    }
);


/* =========================================================
   ERROR DISPLAY
========================================================= */

function showRegistrationError(
    element,
    message
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );
}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

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


function escapeAttribute(value) {
    return escapeHTML(value);
}
