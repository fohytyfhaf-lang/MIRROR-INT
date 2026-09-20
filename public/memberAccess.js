
/* =========================================================
   ABIC MEMBER ACCESS
   Public registration + hidden progression
========================================================= */

import { createLocalAccount } from "../login.js";

const STORAGE_KEY = "abic_member_access_v1";
const REQUIRED_ARCHIVES = 3;


/* =========================================================
   STATE
========================================================= */

function getDefaultState() {
    return {
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

        createdAt: null
    };
}


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

        return {
            ...defaults,
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.warn(
            "[ABIC MEMBER] Failed to read state:",
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

    } catch (error) {

        console.warn(
            "[ABIC MEMBER] Failed to save state:",
            error
        );
    }
}


export function getAbicMemberState() {
    return getState();
}


/* =========================================================
   PROGRESSION
========================================================= */

export function recordArchiveOpen(
    recordId,
    restricted = false
) {

    if (!recordId) return;

    const state = getState();

    if (!Array.isArray(state.openedArchives)) {
        state.openedArchives = [];
    }

    if (!state.openedArchives.includes(recordId)) {

        state.openedArchives.push(
            recordId
        );
    }

    if (restricted) {
        state.restrictedOpened = true;
    }

    saveState(state);

    refreshAccountRequirements();
}


function getArchiveCount(state) {

    return Array.isArray(
        state.openedArchives
    )
        ? state.openedArchives.length
        : 0;
}


function isReadyForReturn(state) {

    return (
        state.accountCreated &&
        getArchiveCount(state) >= REQUIRED_ARCHIVES &&
        state.restrictedOpened &&
        state.profileComplete
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

    if (!content) return;

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
   ACCOUNT CONTENT
========================================================= */

function renderAccountBody(state) {

    const body =
        document.getElementById(
            "abicMemberBody"
        );

    if (!body) return;

    if (!state.accountCreated) {

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

        return;
    }


    renderRegisteredAccount(state);
}


/* =========================================================
   REGISTERED ACCOUNT
========================================================= */

function renderRegisteredAccount(state) {

    const body =
        document.getElementById(
            "abicMemberBody"
        );

    if (!body) return;

    const archiveCount =
        getArchiveCount(state);

    const archiveDone =
        archiveCount >= REQUIRED_ARCHIVES;

    const restrictedDone =
        state.restrictedOpened;

    const profileDone =
        state.profileComplete;

    const returnDone =
        state.returnToAccount;

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
                        <span>Username</span>
                        <strong>
                            ${escapeHTML(
                                state.username
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Email</span>
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
     * The fifth condition is intentionally checked
     * only when this page is opened again.
     */
    if (
        isReadyForReturn(state) &&
        !state.returnToAccount
    ) {

        state.returnToAccount = true;

        saveState(state);

        refreshAccountRequirements();

        setTimeout(
            startTransition,
            450
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

    if (!form) return;

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            createAccount();
        }
    );
}


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


    if (!username || !email || !password) {

        showRegistrationError(
            error,
            "Please complete all required fields."
        );

        return;
    }


    if (password !== confirm) {

        showRegistrationError(
            error,
            "Passwords do not match."
        );

        return;
    }


    if (password.length < 6) {

        showRegistrationError(
            error,
            "Password must contain at least 6 characters."
        );

        return;
    }


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
            accountError.message ||
            "The account could not be created."
        );

        return;
    }


    if (
        !result ||
        result.success === false
    ) {

        showRegistrationError(
            error,
            result?.message ||
            "The account could not be created."
        );

        return;
    }


    const state = getState();

    state.accountCreated = true;
    state.username = username;
    state.email = email;
    state.createdAt = Date.now();

    saveState(state);

    renderAccountBody(state);
}


/* =========================================================
   PROFILE
========================================================= */

function initProfileForm() {

    const form =
        document.getElementById(
            "abicProfileForm"
        );

    if (!form) return;

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const state = getState();

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


            state.displayName = name;
            state.region = region;
            state.interests = interests;
            state.profileComplete = true;

            saveState(state);

            renderAccountBody(state);
        }
    );
}


/* =========================================================
   REQUIREMENTS
========================================================= */

function refreshAccountRequirements() {

    const state = getState();

    const list =
        document.getElementById(
            "abicRequirementList"
        );

    if (!list) return;

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
                ${completed ? "✓" : "○"}
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

    const state = getState();

    if (
        state.transitionStarted
    ) {
        return;
    }

    if (
        !isReadyForReturn(state)
    ) {
        return;
    }

    state.transitionStarted = true;

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

    const state = getDefaultState();

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
   ARCHIVE EVENT
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
   HELPERS
========================================================= */

function showRegistrationError(
    element,
    message
) {

    if (!element) return;

    element.textContent =
        message;

    element.classList.remove(
        "hidden"
    );
}


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

