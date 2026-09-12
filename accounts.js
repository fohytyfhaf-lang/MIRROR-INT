/* ==========================================================
   OMEGA ACCOUNTS
   MIRROR-INT / OMEGA

   RESPONSIBILITY
   ----------------------------------------------------------
   This module defines SYSTEM ACCOUNTS.

   It contains:
   - account identity
   - role
   - clearance
   - permissions
   - account restrictions
   - display information
   - account defaults

   It does NOT contain:
   - login logic
   - password input handling
   - session handling
   - activity history
   - local account creation
   - MR.SMILE behavior

   login.js handles the runtime account system.
========================================================== */


/* ==========================================================
   ACCOUNT FACTORY
========================================================== */

function createAccount({

    username,

    password,

    role = "guest",

    displayName = username,

    clearance = 0,

    description = "",

    department = "GENERAL",

    status = "active",

    permissions = {},

    restrictions = {},

    settings = {}

}) {

    return {

        /*
           Identity
        */

        username,

        displayName,

        description,

        department,


        /*
           Authentication

           NOTE:
           These passwords are only suitable for
           this fictional client-side system.

           They are NOT secure real-world credentials.
        */

        password,


        /*
           Role
        */

        role,

        clearance,


        /*
           Account state
        */

        status,

        system:
            true,

        local:
            false,


        /*
           Permission map
        */

        permissions: {

            viewPublic:
                true,

            viewInternal:
                clearance >= 1,

            viewRestricted:
                clearance >= 3,

            viewTopSecret:
                clearance >= 5,

            useConsole:
                clearance >= 1,

            useCamera:
                clearance >= 1,

            accessArchive:
                clearance >= 2,

            accessMirror:
                clearance >= 2,

            accessResearch:
                clearance >= 3,

            modifySystem:
                clearance >= 5,

            manageAccounts:
                false,

            debug:
                false,

            ...permissions

        },


        /*
           Restrictions
        */

        restrictions: {

            cannotModifySystem:
                clearance < 5,

            cannotManageAccounts:
                true,

            cannotChangeClearance:
                true,

            readOnly:
                false,

            restrictedConsole:
                clearance < 3,

            restrictedCamera:
                clearance < 2,

            ...restrictions

        },


        /*
           Account-specific default settings
        */

        settings: {

            language:
                null,

            uiScale:
                100,

            crt:
                true,

            scanlines:
                true,

            glitch:
                true,

            audioMaster:
                70,

            musicVolume:
                70,

            effectsVolume:
                70,

            ...settings

        }

    };

}


/* ==========================================================
   SYSTEM ACCOUNTS
========================================================== */

export const Accounts = {


    /* ======================================================
       OPERATOR
    ====================================================== */

    operator:
        createAccount({

            username:
                "operator",

            password:
                "0404",

            role:
                "operator",

            displayName:
                "Operator 0404",

            clearance:
                2,

            department:
                "OMEGA OPERATIONS",

            description:
                "Standard OMEGA operational account.",

            permissions: {

                accessArchive:
                    true,

                accessMirror:
                    true,

                useConsole:
                    true,

                useCamera:
                    true

            }

        }),


    /* ======================================================
       ADMIN
    ====================================================== */

    admin:
        createAccount({

            username:
                "admin",

            password:
                "0000",

            role:
                "admin",

            displayName:
                "Administrator",

            clearance:
                5,

            department:
                "OMEGA ADMINISTRATION",

            description:
                "Highest standard administrative account.",

            permissions: {

                accessArchive:
                    true,

                accessMirror:
                    true,

                accessResearch:
                    true,

                viewRestricted:
                    true,

                viewTopSecret:
                    true,

                useConsole:
                    true,

                useCamera:
                    true,

                modifySystem:
                    true,

                manageAccounts:
                    true,

                debug:
                    true

            },

            restrictions: {

                cannotModifySystem:
                    false,

                cannotManageAccounts:
                    false,

                cannotChangeClearance:
                    false,

                restrictedConsole:
                    false,

                restrictedCamera:
                    false

            }

        }),


    /* ======================================================
       GUEST
    ====================================================== */

    guest:
        createAccount({

            username:
                "guest",

            password:
                "1234",

            role:
                "guest",

            displayName:
                "Guest",

            clearance:
                0,

            department:
                "PUBLIC",

            description:
                "Limited public-access account.",

            permissions: {

                viewPublic:
                    true,

                useConsole:
                    false,

                useCamera:
                    false,

                accessArchive:
                    false,

                accessMirror:
                    false

            },

            restrictions: {

                readOnly:
                    true,

                restrictedConsole:
                    true,

                restrictedCamera:
                    true

            }

        }),


    /* ======================================================
       TESTER
    ====================================================== */

    test:
        createAccount({

            username:
                "test",

            password:
                "1111",

            role:
                "tester",

            displayName:
                "Test User",

            clearance:
                1,

            department:
                "SYSTEM TESTING",

            description:
                "Testing and diagnostic account.",

            permissions: {

                useConsole:
                    true,

                useCamera:
                    true,

                accessArchive:
                    false,

                accessMirror:
                    false,

                debug:
                    false

            },

            restrictions: {

                restrictedConsole:
                    false,

                restrictedCamera:
                    false,

                readOnly:
                    false

            }

        })

};


/* ==========================================================
   ACCOUNT LOOKUP
========================================================== */

export function getAccount(
    username
) {

    if (
        typeof username !==
        "string"
    ) {

        return null;

    }


    const key =
        username.trim();


    if (
        !key
    ) {

        return null;

    }


    return (
        Accounts[key] ||
        null
    );

}


/* ==========================================================
   CHECK ACCOUNT EXISTS
========================================================== */

export function accountExists(
    username
) {

    return (
        getAccount(
            username
        ) !== null
    );

}


/* ==========================================================
   GET ACCOUNT ROLE
========================================================== */

export function getAccountRole(
    username
) {

    return (
        getAccount(
            username
        )?.role ||
        null
    );

}


/* ==========================================================
   GET ACCOUNT CLEARANCE
========================================================== */

export function getAccountClearance(
    username
) {

    return Number(
        getAccount(
            username
        )?.clearance ??
        0
    );

}


/* ==========================================================
   CHECK PERMISSION
========================================================== */

export function hasAccountPermission(
    username,
    permission
) {

    const account =
        getAccount(
            username
        );


    if (
        !account
    ) {

        return false;

    }


    if (
        typeof permission !==
        "string"
    ) {

        return false;

    }


    return (
        account.permissions?.[
            permission
        ] === true
    );

}


/* ==========================================================
   CHECK RESTRICTION
========================================================== */

export function hasAccountRestriction(
    username,
    restriction
) {

    const account =
        getAccount(
            username
        );


    if (
        !account
    ) {

        return false;

    }


    if (
        typeof restriction !==
        "string"
    ) {

        return false;

    }


    return (
        account.restrictions?.[
            restriction
        ] === true
    );

}


/* ==========================================================
   GET ACCOUNT SETTINGS
========================================================== */

export function getAccountSettings(
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


    return {

        ...(
            account.settings ||
            {}
        )

    };

}


/* ==========================================================
   GET ACCOUNT SUMMARY
========================================================== */

export function getAccountSummary(
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


    return {

        username:
            account.username,

        displayName:
            account.displayName,

        role:
            account.role,

        clearance:
            account.clearance,

        department:
            account.department,

        status:
            account.status,

        system:
            account.system === true,

        local:
            account.local === true

    };

}


/* ==========================================================
   LIST SYSTEM ACCOUNTS
========================================================== */

export function listAccounts() {

    return Object.values(
        Accounts
    ).map(
        account => ({
            
            username:
                account.username,

            displayName:
                account.displayName,

            role:
                account.role,

            clearance:
                account.clearance,

            department:
                account.department,

            status:
                account.status,

            system:
                account.system === true

        })
    );

}


/* ==========================================================
   GET ACCOUNTS BY ROLE
========================================================== */

export function getAccountsByRole(
    role
) {

    if (
        typeof role !==
        "string"
    ) {

        return [];

    }


    return Object.values(
        Accounts
    )
        .filter(
            account =>
                account.role ===
                role
        )
        .map(
            account =>
                account.username
        );

}


/* ==========================================================
   GET ACCOUNTS BY CLEARANCE
========================================================== */

export function getAccountsByClearance(
    minimumClearance = 0
) {

    const minimum =
        Number(
            minimumClearance
        ) || 0;


    return Object.values(
        Accounts
    )
        .filter(
            account =>
                Number(
                    account.clearance
                ) >= minimum
        )
        .map(
            account =>
                account.username
        );

}


/* ==========================================================
   SAFE ACCOUNT DATA
   ----------------------------------------------------------
   Used by UI/debug/admin systems.

   NEVER exposes passwords.
========================================================== */

export function getSafeAccount(
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


    return {

        username:
            account.username,

        displayName:
            account.displayName,

        role:
            account.role,

        clearance:
            account.clearance,

        description:
            account.description,

        department:
            account.department,

        status:
            account.status,

        system:
            account.system,

        local:
            account.local,

        permissions:
            {
                ...(
                    account.permissions ||
                    {}
                )
            },

        restrictions:
            {
                ...(
                    account.restrictions ||
                    {}
                )
            },

        settings:
            {
                ...(
                    account.settings ||
                    {}
                )
            }

    };

}


/* ==========================================================
   ACCOUNT SECURITY HELPERS
========================================================== */

export function canAccountAccessClearance(
    username,
    requiredClearance
) {

    const current =
        getAccountClearance(
            username
        );


    const required =
        Math.max(
            0,
            Number(
                requiredClearance
            ) || 0
        );


    return (
        current >=
        required
    );

}


export function canAccountModifySystem(
    username
) {

    return hasAccountPermission(
        username,
        "modifySystem"
    );

}


export function canAccountManageAccounts(
    username
) {

    return hasAccountPermission(
        username,
        "manageAccounts"
    );

}


/* ==========================================================
   FUTURE ACCOUNT TYPES
   ----------------------------------------------------------
   These definitions do not create accounts yet.

   They provide a consistent basis for future
   registration / invitation / server accounts.
========================================================== */

export const AccountTemplates = {

    researcher: {

        role:
            "researcher",

        defaultClearance:
            3,

        department:
            "RESEARCH",

        permissions: {

            viewPublic:
                true,

            viewInternal:
                true,

            viewRestricted:
                true,

            accessResearch:
                true,

            useConsole:
                true,

            useCamera:
                true

        }

    },


    security: {

        role:
            "security",

        defaultClearance:
            3,

        department:
            "SECURITY",

        permissions: {

            viewPublic:
                true,

            viewInternal:
                true,

            viewRestricted:
                true,

            useConsole:
                true,

            useCamera:
                true,

            accessArchive:
                true

        }

    },


    archivist: {

        role:
            "archivist",

        defaultClearance:
            3,

        department:
            "ARCHIVES",

        permissions: {

            viewPublic:
                true,

            viewInternal:
                true,

            viewRestricted:
                true,

            accessArchive:
                true,

            accessMirror:
                true

        }

    },


    observer: {

        role:
            "observer",

        defaultClearance:
            1,

        department:
            "OBSERVATION",

        permissions: {

            viewPublic:
                true,

            viewInternal:
                true,

            useCamera:
                true

        }

    }

};


/* ==========================================================
   DEBUG API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.OMEGA_ACCOUNT_DEFINITIONS = {

        get:
            getAccount,

        exists:
            accountExists,

        role:
            getAccountRole,

        clearance:
            getAccountClearance,

        permission:
            hasAccountPermission,

        restriction:
            hasAccountRestriction,

        settings:
            getAccountSettings,

        summary:
            getAccountSummary,

        safe:
            getSafeAccount,

        list:
            listAccounts,

        byRole:
            getAccountsByRole,

        byClearance:
            getAccountsByClearance,

        canAccess:
            canAccountAccessClearance,

        canModifySystem:
            canAccountModifySystem,

        canManageAccounts:
            canAccountManageAccounts

    };

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default Accounts;
