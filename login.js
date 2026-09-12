/* ==========================================================
   OMEGA LOGIN / ACCOUNT SYSTEM
   MIRROR-INT / OMEGA

   RESPONSIBILITY
   ----------------------------------------------------------
   This module handles:

   - login
   - logout
   - account profiles
   - local account creation
   - per-account persistent data
   - per-account action history
   - session statistics
   - login history
   - account-specific settings
   - user activity event tracking

   IMPORTANT
   ----------------------------------------------------------
   This is a client-side account system.

   GitHub Pages has no secure server-side authentication.
   Accounts created here exist only in this browser.

   Passwords are NOT stored inside activity history.
========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    playMusic
} from "./audio.js";


import {
    setRole
} from "./security.js";


import {
    Storage
} from "./storage.js";


import {
    trigger,
    on
} from "./eventManager.js";


import {
    applySettings
} from "./systemConfig.js";


import {
    t
} from "./languageManager4.js";


import {
    Accounts
} from "./accounts.js";


/* ==========================================================
   STORAGE KEYS
========================================================== */

const STORAGE = {

    currentUser:
        "currentUser",

    users:
        "users",

    localAccounts:
        "omega_local_accounts",

    sessions:
        "omega_sessions",

    system:
        "omega_system"

};


/* ==========================================================
   LIMITS
========================================================== */

const LIMITS = {

    history:
        250,

    sessions:
        50,

    text:
        500

};


/* ==========================================================
   INTERNAL STATE
========================================================== */

const STATE = {

    initialized:
        false,

    activityListenersRegistered:
        false,

    currentSessionId:
        null,

    currentSessionStarted:
        0

};


/* ==========================================================
   UTILITY
========================================================== */

function now() {

    return Date.now();

}


function cleanText(
    value,
    maxLength = LIMITS.text
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .trim()
        .slice(
            0,
            maxLength
        );

}


function createId(
    prefix = "id"
) {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );

}


/* ==========================================================
   STORAGE SAFE HELPERS
========================================================== */

function safeGet(
    key,
    fallback = null
) {

    try {

        return Storage.get(
            key,
            fallback
        );

    } catch (error) {

        console.warn(
            "[OMEGA LOGIN] Storage read failed:",
            key,
            error
        );

        return fallback;

    }

}


function safeSet(
    key,
    value
) {

    try {

        Storage.set(
            key,
            value
        );

        return true;

    } catch (error) {

        console.warn(
            "[OMEGA LOGIN] Storage write failed:",
            key,
            error
        );

        return false;

    }

}


/* ==========================================================
   ACCOUNT SOURCES
   ----------------------------------------------------------
   Static Accounts:
       accounts.js

   Local Accounts:
       localStorage

   Local accounts are future-proofing for
   browser-side account creation.
========================================================== */

function getLocalAccounts() {

    const accounts =
        safeGet(
            STORAGE.localAccounts,
            {}
        );


    if (
        !accounts ||
        typeof accounts !==
        "object"
    ) {

        return {};

    }


    return accounts;

}


function getAllAccounts() {

    const result = {

        ...Accounts

    };


    const localAccounts =
        getLocalAccounts();


    for (
        const [username, account]
        of Object.entries(
            localAccounts
        )
    ) {

        if (
            !result[username]
        ) {

            result[username] =
                account;

        }

    }


    return result;

}


function getAccount(
    username
) {

    const key =
        cleanText(
            username
        );


    if (
        !key
    ) {

        return null;

    }


    const accounts =
        getAllAccounts();


    return (
        accounts[key] ||
        null
    );

}


/* ==========================================================
   ACCOUNT PROFILE DEFAULT
========================================================== */

function createDefaultProfile(
    username,
    account
) {

    const timestamp =
        now();


    return {

        username,

        displayName:
            account?.displayName ||
            username,

        role:
            account?.role ||
            "guest",

        clearance:
            Number(
                account?.clearance ??
                0
            ),


        createdAt:
            timestamp,

        lastLogin:
            null,

        lastLogout:
            null,

        loginCount:
            0,

        logoutCount:
            0,

        sessionCount:
            0,

        totalActions:
            0,


        settings:
            {},


        statistics: {

            filesOpened:
                0,

            restrictedFilesOpened:
                0,

            windowsOpened:
                0,

            windowsClosed:
                0,

            consoleCommands:
                0,

            cameraVisits:
                0,

            chatMessages:
                0,

            mrSmileInteractions:
                0,

            settingsChanges:
                0,

            errors:
                0,

            deniedActions:
                0

        },


        history: []

    };

}


/* ==========================================================
   GET ALL USER PROFILES
========================================================== */

function getUserProfiles() {

    const users =
        safeGet(
            STORAGE.users,
            {}
        );


    if (
        !users ||
        typeof users !==
        "object"
    ) {

        return {};

    }


    return users;

}


/* ==========================================================
   SAVE USER PROFILES
========================================================== */

function saveUserProfiles(
    users
) {

    return safeSet(
        STORAGE.users,
        users
    );

}


/* ==========================================================
   GET PROFILE
========================================================== */

export function getUserProfile(
    username =
        getCurrentUser()
) {

    if (
        !username
    ) {

        return null;

    }


    const users =
        getUserProfiles();


    return (
        users[username] ||
        null
    );

}


/* ==========================================================
   ENSURE PROFILE
========================================================== */

export function ensureUserProfile(
    username
) {

    const account =
        getAccount(
            username
        );


    if (
        !account
    ) {

        return null;

    }


    const users =
        getUserProfiles();


    if (
        !users[username]
    ) {

        users[username] =
            createDefaultProfile(
                username,
                account
            );


        saveUserProfiles(
            users
        );

        return users[username];

    }


    /*
       Migration / repair for older
       profile structures.
    */

    const profile =
        users[username];


    if (
        !profile.statistics
    ) {

        profile.statistics = {};

    }


    const statistics =
        profile.statistics;


    const defaultStatistics =
        createDefaultProfile(
            username,
            account
        ).statistics;


    for (
        const [
            key,
            value
        ]
        of Object.entries(
            defaultStatistics
        )
    ) {

        if (
            typeof statistics[key] !==
            "number"
        ) {

            statistics[key] =
                value;

        }

    }


    if (
        !Array.isArray(
            profile.history
        )
    ) {

        profile.history = [];

    }


    if (
        !profile.settings ||
        typeof profile.settings !==
        "object"
    ) {

        profile.settings = {};

    }


    profile.username =
        username;


    profile.role =
        account.role ||
        profile.role ||
        "guest";


    profile.clearance =
        Number(
            account.clearance ??
            profile.clearance ??
            0
        );


    profile.displayName =
        account.displayName ||
        profile.displayName ||
        username;


    saveUserProfiles(
        users
    );


    return profile;

}


/* ==========================================================
   CURRENT USER
========================================================== */

export function getCurrentUser() {

    return safeGet(
        STORAGE.currentUser,
        null
    );

}


/* ==========================================================
   SET CURRENT USER
========================================================== */

function setCurrentUser(
    username
) {

    return safeSet(
        STORAGE.currentUser,
        username
    );

}


/* ==========================================================
   CLEAR CURRENT USER
========================================================== */

function clearCurrentUser() {

    try {

        Storage.remove(
            STORAGE.currentUser
        );

        return true;

    } catch (error) {

        console.warn(
            "[OMEGA LOGIN] Could not clear current user:",
            error
        );

        return false;

    }

}


/* ==========================================================
   ACCOUNT HISTORY
========================================================== */

export function recordUserAction(
    type,
    data = {}
) {

    const username =
        getCurrentUser();


    if (
        !username
    ) {

        return false;

    }


    const profile =
        ensureUserProfile(
            username
        );


    if (
        !profile
    ) {

        return false;

    }


    const actionType =
        cleanText(
            type,
            100
        ) ||
        "unknown";


    const entry = {

        id:
            createId(
                "activity"
            ),

        type:
            actionType,

        timestamp:
            now(),

        sessionId:
            STATE.currentSessionId,

        data:
            sanitizeActivityData(
                data
            )

    };


    profile.history
        .push(
            entry
        );


    if (
        profile.history.length >
        LIMITS.history
    ) {

        profile.history =
            profile.history.slice(
                -LIMITS.history
            );

    }


    profile.totalActions +=
        1;


    updateStatistics(
        profile,
        actionType
    );


    saveCurrentProfile(
        profile
    );


    trigger(
        "user.activityRecorded",
        {

            username,

            action:
                entry

        }
    );


    return entry;

}


/* ==========================================================
   SANITIZE ACTIVITY DATA
   ----------------------------------------------------------
   Never place credentials/passwords
   in account history.
========================================================== */

function sanitizeActivityData(
    data
) {

    if (
        !data ||
        typeof data !==
        "object"
    ) {

        return {};

    }


    const result = {};

    const forbidden = new Set([

        "password",

        "pass",

        "passwd",

        "token",

        "secret",

        "credential",

        "credentials",

        "authorization",

        "auth"

    ]);


    for (
        const [
            key,
            value
        ]
        of Object.entries(
            data
        )
    ) {

        if (
            forbidden.has(
                String(key)
                    .toLowerCase()
            )
        ) {

            continue;

        }


        if (
            typeof value ===
            "function"
        ) {

            continue;

        }


        if (
            value &&
            typeof value ===
            "object"
        ) {

            try {

                result[key] =
                    JSON.parse(
                        JSON.stringify(
                            value
                        )
                    );

            } catch {

                result[key] =
                    String(value);

            }

            continue;

        }


        result[key] =
            typeof value ===
            "string"
                ? cleanText(value)
                : value;

    }


    return result;

}


/* ==========================================================
   UPDATE STATISTICS
========================================================== */

function updateStatistics(
    profile,
    actionType
) {

    const stats =
        profile.statistics;


    switch (
        actionType
    ) {

        case "file.open":
        case "file.read":

            stats.filesOpened += 1;

            break;


        case "restricted.file.open":

            stats.restrictedFilesOpened += 1;

            break;


        case "window.open":

            stats.windowsOpened += 1;

            break;


        case "window.close":

            stats.windowsClosed += 1;

            break;


        case "console.command":

            stats.consoleCommands += 1;

            break;


        case "camera.visit":

            stats.cameraVisits += 1;

            break;


        case "chat.message":

            stats.chatMessages += 1;

            break;


        case "mrsmile.message":
        case "mrsmile.interaction":

            stats.mrSmileInteractions += 1;

            break;


        case "settings.change":

            stats.settingsChanges += 1;

            break;


        case "access.denied":

            stats.deniedActions += 1;

            break;


        case "error":

            stats.errors += 1;

            break;

    }

}


/* ==========================================================
   SAVE CURRENT PROFILE
========================================================== */

function saveCurrentProfile(
    profile
) {

    if (
        !profile ||
        !profile.username
    ) {

        return false;

    }


    const users =
        getUserProfiles();


    users[
        profile.username
    ] =
        profile;


    return saveUserProfiles(
        users
    );

}


/* ==========================================================
   LOGIN HISTORY
========================================================== */

function addSession(
    profile
) {

    if (
        !profile
    ) {

        return null;

    }


    const session = {

        id:
            createId(
                "session"
            ),

        startedAt:
            now(),

        endedAt:
            null,

        duration:
            null

    };


    const sessions =
        profile.sessions ||
        [];


    sessions.push(
        session
    );


    profile.sessions =
        sessions.slice(
            -LIMITS.sessions
        );


    profile.sessionCount +=
        1;


    STATE.currentSessionId =
        session.id;


    STATE.currentSessionStarted =
        session.startedAt;


    return session;

}


/* ==========================================================
   FINISH SESSION
========================================================== */

function finishCurrentSession(
    profile
) {

    if (
        !profile ||
        !STATE.currentSessionId
    ) {

        return;

    }


    const sessions =
        Array.isArray(
            profile.sessions
        )
            ? profile.sessions
            : [];


    const session =
        sessions.find(
            item =>
                item.id ===
                STATE.currentSessionId
        );


    if (
        !session
    ) {

        return;

    }


    session.endedAt =
        now();


    session.duration =
        Math.max(
            0,
            session.endedAt -
            session.startedAt
        );


    profile.sessions =
        sessions.slice(
            -LIMITS.sessions
        );


    STATE.currentSessionId =
        null;

    STATE.currentSessionStarted =
        0;

}


/* ==========================================================
   CREATE LOCAL ACCOUNT
   ----------------------------------------------------------
   Browser-only account creation.

   Example:

   createLocalAccount(
       "researcher",
       "my-password",
       {
           role: "researcher",
           displayName: "Researcher",
           clearance: 2
       }
   );
========================================================== */

export function createLocalAccount(
    username,
    password,
    options = {}
) {

    const normalizedUsername =
        cleanText(
            username,
            40
        );


    if (
        !normalizedUsername
    ) {

        return {

            ok:
                false,

            reason:
                "invalid_username"

        };

    }


    if (
        !/^[A-Za-z0-9_.-]+$/
            .test(
                normalizedUsername
            )
    ) {

        return {

            ok:
                false,

            reason:
                "invalid_username_format"

        };

    }


    if (
        typeof password !==
        "string" ||
        password.length <
        1
    ) {

        return {

            ok:
                false,

            reason:
                "invalid_password"

        };

    }


    if (
        getAccount(
            normalizedUsername
        )
    ) {

        return {

            ok:
                false,

            reason:
                "account_exists"

        };

    }


    const localAccounts =
        getLocalAccounts();


    localAccounts[
        normalizedUsername
    ] = {

        password,

        role:
            cleanText(
                options.role ||
                "guest",
                40
            ),

        displayName:
            cleanText(
                options.displayName ||
                normalizedUsername,
                100
            ),

        clearance:
            Math.max(
                0,
                Number(
                    options.clearance ??
                    0
                )
            ),

        local:
            true,

        createdAt:
            now()

    };


    if (
        !safeSet(
            STORAGE.localAccounts,
            localAccounts
        )
    ) {

        return {

            ok:
                false,

            reason:
                "storage_failed"

        };

    }


    ensureUserProfile(
        normalizedUsername
    );


    trigger(
        "user.accountCreated",
        {

            username:
                normalizedUsername,

            role:
                localAccounts[
                    normalizedUsername
                ].role,

            clearance:
                localAccounts[
                    normalizedUsername
                ].clearance,

            timestamp:
                now()

        }
    );


    return {

        ok:
            true,

        username:
            normalizedUsername

    };

}


/* ==========================================================
   DELETE LOCAL ACCOUNT
========================================================== */

export function deleteLocalAccount(
    username
) {

    const normalizedUsername =
        cleanText(
            username
        );


    const localAccounts =
        getLocalAccounts();


    if (
        !localAccounts[
            normalizedUsername
        ]
    ) {

        return false;

    }


    delete localAccounts[
        normalizedUsername
    ];


    safeSet(
        STORAGE.localAccounts,
        localAccounts
    );


    const users =
        getUserProfiles();


    delete users[
        normalizedUsername
    ];


    saveUserProfiles(
        users
    );


    trigger(
        "user.accountDeleted",
        {

            username:
                normalizedUsername,

            timestamp:
                now()

        }
    );


    return true;

}


/* ==========================================================
   AUTHENTICATE
========================================================== */

function authenticate(
    username,
    password
) {

    const account =
        getAccount(
            username
        );


    if (
        !account
    ) {

        return {

            ok:
                false,

            reason:
                "unknown_user"

        };

    }


    if (
        account.password !==
        password
    ) {

        return {

            ok:
                false,

            reason:
                "wrong_password"

        };

    }


    return {

        ok:
            true,

        account

    };

}


/* ==========================================================
   LOGIN ATTEMPT EVENT
========================================================== */

function recordLoginAttempt(
    username,
    success,
    reason = null
) {

    trigger(
        "user.loginAttempt",
        {

            username:
                cleanText(
                    username,
                    40
                ),

            success:
                Boolean(
                    success
                ),

            reason:
                reason ||
                null,

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   OPEN OMEGA LOGIN
========================================================== */

export function openOmegaLogin() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    if (
        !loginScreen
    ) {

        console.warn(
            "OMEGA LOGIN: loginScreen not found"
        );

        return;

    }


    loginScreen.classList.remove(
        "hidden"
    );


    const userEl =
        document.getElementById(
            "user"
        );


    const passEl =
        document.getElementById(
            "pass"
        );


    const status =
        document.getElementById(
            "status"
        );


    if (
        userEl
    ) {

        userEl.value =
            "";

    }


    if (
        passEl
    ) {

        passEl.value =
            "";

    }


    if (
        status
    ) {

        status.textContent =
            t(
                "login.awaiting"
            );

    }


    const loginBtn =
        document.getElementById(
            "loginBtn"
        );


    if (
        loginBtn &&
        !loginBtn.dataset.bound
    ) {

        loginBtn.addEventListener(
            "click",
            loginSystem
        );


        loginBtn.dataset.bound =
            "true";

    }


    setTimeout(
        () => {

            userEl?.focus();

        },
        100
    );

}


/* ==========================================================
   CLOSE OMEGA LOGIN
========================================================== */

export function closeOmegaLogin() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    if (
        !loginScreen
    ) {

        return;

    }


    loginScreen.classList.add(
        "hidden"
    );

}


/* ==========================================================
   LOGIN
========================================================== */

export function loginSystem() {

    const userEl =
        document.getElementById(
            "user"
        );


    const passEl =
        document.getElementById(
            "pass"
        );


    const status =
        document.getElementById(
            "status"
        );


    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    const desktop =
        document.getElementById(
            "desktop"
        );


    if (
        !userEl ||
        !passEl
    ) {

        return;

    }


    const username =
        userEl.value.trim();


    const password =
        passEl.value;


    /* ------------------------------------------------------
       EMPTY
    ------------------------------------------------------ */

    if (
        !username ||
        !password
    ) {

        if (
            status
        ) {

            status.textContent =
                t(
                    "login.enterCredentials"
                );

        }

        recordLoginAttempt(
            username,
            false,
            "empty_credentials"
        );

        return;

    }


    console.log(
        "OMEGA LOGIN TRY:",
        username
    );


    const result =
        authenticate(
            username,
            password
        );


    /* ------------------------------------------------------
       FAILED LOGIN
    ------------------------------------------------------ */

    if (
        !result.ok
    ) {

        console.warn(
            "OMEGA LOGIN FAILED:",
            username,
            result.reason
        );


        if (
            status
        ) {

            if (
                result.reason ===
                "unknown_user"
            ) {

                status.textContent =
                    t(
                        "login.unknownUser"
                    );

            } else {

                status.textContent =
                    t(
                        "login.wrongPassword"
                    );

            }

        }


        recordLoginAttempt(
            username,
            false,
            result.reason
        );


        return;

    }


    const account =
        result.account;


    /* ------------------------------------------------------
       PROFILE
    ------------------------------------------------------ */

    const profile =
        ensureUserProfile(
            username
        );


    if (
        !profile
    ) {

        if (
            status
        ) {

            status.textContent =
                "ACCOUNT PROFILE ERROR";

        }

        return;

    }


    profile.lastLogin =
        now();


    profile.loginCount +=
        1;


    addSession(
        profile
    );


    saveCurrentProfile(
        profile
    );


    /* ------------------------------------------------------
       REMEMBER CURRENT USER
    ------------------------------------------------------ */

    setCurrentUser(
        username
    );


    /* ------------------------------------------------------
       ROLE
    ------------------------------------------------------ */

    setRole(
        account.role
    );


    /* ------------------------------------------------------
       MUSIC
    ------------------------------------------------------ */

    try {

        const settings =
            profile.settings ||
            {};


        playMusic(
            "background.mp3",
            0.3,
            settings
        );


    } catch (error) {

        console.warn(
            "OMEGA MUSIC ERROR:",
            error
        );

    }


    /* ------------------------------------------------------
       LOGIN SUCCESS EVENT
    ------------------------------------------------------ */

    recordLoginAttempt(
        username,
        true
    );


    recordUserAction(
        "login.success",
        {

            role:
                account.role,

            clearance:
                account.clearance

        }
    );


    /* ------------------------------------------------------
       ENTER OMEGA
    ------------------------------------------------------ */

    setTimeout(
        () => {

            loginScreen?.classList.add(
                "hidden"
            );


            desktop?.classList.remove(
                "hidden"
            );


            applySettings();


            trigger(
                "user.login",
                {

                    username,

                    role:
                        account.role,

                    clearance:
                        account.clearance,

                    displayName:
                        account.displayName,

                    sessionId:
                        STATE.currentSessionId,

                    profileCreatedAt:
                        profile.createdAt

                }
            );


            trigger(
                "user.profileLoaded",
                {

                    username,

                    profile:
                        getUserProfile(
                            username
                        )

                }
            );


        },
        400
    );

}


/* ==========================================================
   LOGOUT
========================================================== */

export function logoutOmega() {

    const username =
        getCurrentUser();


    const profile =
        username
            ? ensureUserProfile(
                username
            )
            : null;


    if (
        profile
    ) {

        recordUserAction(
            "logout",
            {}
        );


        finishCurrentSession(
            profile
        );


        profile.lastLogout =
            now();


        profile.logoutCount +=
            1;


        saveCurrentProfile(
            profile
        );

    }


    const desktop =
        document.getElementById(
            "desktop"
        );


    if (
        desktop
    ) {

        desktop.classList.add(
            "hidden"
        );

    }


    clearCurrentUser();


    trigger(
        "user.logout",
        {

            username,

            timestamp:
                now()

        }
    );


    console.log(
        "OMEGA LOGOUT:",
        username
    );

}


/* ==========================================================
   GET CURRENT PROFILE
========================================================== */

export function getCurrentUserProfile() {

    const username =
        getCurrentUser();


    if (
        !username
    ) {

        return null;

    }


    return ensureUserProfile(
        username
    );

}


/* ==========================================================
   GET USER HISTORY
========================================================== */

export function getUserHistory(
    username =
        getCurrentUser()
) {

    const profile =
        getUserProfile(
            username
        );


    if (
        !profile
    ) {

        return [];

    }


    return Array.isArray(
        profile.history
    )
        ? [
            ...profile.history
        ]
        : [];

}


/* ==========================================================
   GET USER STATISTICS
========================================================== */

export function getUserStatistics(
    username =
        getCurrentUser()
) {

    const profile =
        getUserProfile(
            username
        );


    if (
        !profile
    ) {

        return null;

    }


    return {

        ...profile.statistics,

        totalActions:
            profile.totalActions,

        loginCount:
            profile.loginCount,

        logoutCount:
            profile.logoutCount,

        sessionCount:
            profile.sessionCount

    };

}


/* ==========================================================
   GET USER SESSIONS
========================================================== */

export function getUserSessions(
    username =
        getCurrentUser()
) {

    const profile =
        getUserProfile(
            username
        );


    if (
        !profile ||
        !Array.isArray(
            profile.sessions
        )
    ) {

        return [];

    }


    return [
        ...profile.sessions
    ];

}


/* ==========================================================
   UPDATE USER SETTINGS
========================================================== */

export function updateUserSettings(
    settings = {}
) {

    const username =
        getCurrentUser();


    if (
        !username ||
        !settings ||
        typeof settings !==
        "object"
    ) {

        return false;

    }


    const profile =
        ensureUserProfile(
            username
        );


    if (
        !profile
    ) {

        return false;

    }


    profile.settings = {

        ...profile.settings,

        ...settings

    };


    saveCurrentProfile(
        profile
    );


    recordUserAction(
        "settings.change",
        {
            keys:
                Object.keys(
                    settings
                )
        }
    );


    trigger(
        "user.settingsChanged",
        {

            username,

            settings

        }
    );


    return true;

}


/* ==========================================================
   ACTIVITY LISTENER HELPERS
========================================================== */

function registerActivityEvent(
    eventName,
    activityType,
    transform =
        data => data
) {

    on(
        eventName,
        data => {

            const username =
                getCurrentUser();


            if (
                !username
            ) {

                return;

            }


            recordUserAction(
                activityType,
                transform(
                    data ||
                    {}
                )
            );

        }
    );

}


/* ==========================================================
   REGISTER OMEGA ACTIVITY EVENTS
========================================================== */

function registerActivityListeners() {

    if (
        STATE.activityListenersRegistered
    ) {

        return;

    }


    /*
       File activity
    */

    registerActivityEvent(
        "mrsmile:operatorFileRead",
        "file.read"
    );


    registerActivityEvent(
        "mrsmile:operatorReadFile",
        "file.read.legacy"
    );


    registerActivityEvent(
        "mrsmile:restrictedFileOpened",
        "restricted.file.open"
    );


    registerActivityEvent(
        "mrsmile:fileAccessDenied",
        "access.denied"
    );


    /*
       Windows
    */

    registerActivityEvent(
        "windowOpened",
        "window.open"
    );


    registerActivityEvent(
        "windowClosed",
        "window.close"
    );


    registerActivityEvent(
        "windowFocused",
        "window.focus"
    );


    registerActivityEvent(
        "windowMoved",
        "window.move"
    );


    /*
       Console
    */

    registerActivityEvent(
        "console.command",
        "console.command"
    );


    registerActivityEvent(
        "mrsmile:consoleCommand",
        "console.command"
    );


    /*
       Camera
    */

    registerActivityEvent(
        "camera.changed",
        "camera.visit"
    );


    registerActivityEvent(
        "mrsmile:cameraChanged",
        "camera.visit"
    );


    /*
       Chat
    */

    registerActivityEvent(
        "chat.message",
        "chat.message"
    );


    registerActivityEvent(
        "mrsmile:operatorMessage",
        "mrsmile.message"
    );


    /*
       MR.SMILE interaction
    */

    registerActivityEvent(
        "mrsmile:decisionMade",
        "mrsmile.interaction"
    );


    registerActivityEvent(
        "mrsmile:actionRequested",
        "mrsmile.interaction"
    );


    registerActivityEvent(
        "mrsmile:firstContactCompleted",
        "mrsmile.firstContact"
    );


    /*
       System errors
    */

    registerActivityEvent(
        "system.error",
        "error"
    );


    STATE.activityListenersRegistered =
        true;

}


/* ==========================================================
   SYSTEM ACCOUNT DATA
========================================================== */

export function getAccountsOverview() {

    const accounts =
        getAllAccounts();


    const profiles =
        getUserProfiles();


    return Object.keys(
        accounts
    ).map(
        username => {

            const account =
                accounts[
                    username
                ];


            const profile =
                profiles[
                    username
                ] ||
                null;


            return {

                username,

                displayName:
                    account.displayName ||
                    username,

                role:
                    account.role ||
                    "guest",

                clearance:
                    Number(
                        account.clearance ||
                        0
                    ),

                local:
                    account.local ===
                    true,

                createdAt:
                    profile?.createdAt ??
                    account.createdAt ??
                    null,

                lastLogin:
                    profile?.lastLogin ??
                    null,

                loginCount:
                    profile?.loginCount ??
                    0,

                totalActions:
                    profile?.totalActions ??
                    0

            };

        }
    );

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initOmegaLogin() {

    if (
        STATE.initialized
    ) {

        return;

    }


    registerActivityListeners();


    const currentUser =
        getCurrentUser();


    if (
        currentUser &&
        getAccount(
            currentUser
        )
    ) {

        ensureUserProfile(
            currentUser
        );

    }


    STATE.initialized =
        true;


    trigger(
        "login.systemInitialized",
        {

            currentUser,

            timestamp:
                now()

        }
    );


    console.log(
        "[OMEGA LOGIN] Account system initialized."
    );

}


/* ==========================================================
   AUTO INIT
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.addEventListener(
        "load",
        () => {

            try {

                initOmegaLogin();

            } catch (error) {

                console.error(
                    "[OMEGA LOGIN] Initialization failed:",
                    error
                );

            }

        },
        {
            once:
                true
        }
    );

}


/* ==========================================================
   GLOBAL DEBUG / FUTURE API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.OMEGA_ACCOUNTS = {

        current:
            getCurrentUser,

        profile:
            getCurrentUserProfile,

        history:
            getUserHistory,

        statistics:
            getUserStatistics,

        sessions:
            getUserSessions,

        overview:
            getAccountsOverview,

        create:
            createLocalAccount,

        delete:
            deleteLocalAccount,

        action:
            recordUserAction,

        settings:
            updateUserSettings,

        init:
            initOmegaLogin

    };

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    openOmegaLogin,

    closeOmegaLogin,

    loginSystem,

    logoutOmega,

    getCurrentUser,

    getUserProfile,

    getCurrentUserProfile,

    getUserHistory,

    getUserStatistics,

    getUserSessions,

    getAccountsOverview,

    createLocalAccount,

    deleteLocalAccount,

    recordUserAction,

    updateUserSettings,

    ensureUserProfile,

    initOmegaLogin

};
