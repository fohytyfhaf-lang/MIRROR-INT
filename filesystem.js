/* ==========================================================
   OMEGA VIRTUAL FILESYSTEM
   MIRROR-INT / OMEGA

   RESPONSIBILITY
   ----------------------------------------------------------
   This module contains the virtual filesystem only.

   It handles:
   - virtual directories
   - virtual text files
   - external files
   - hidden files
   - security levels
   - MR.SMILE read events

   It does NOT handle:
   - MR.SMILE personality
   - behavior decisions
   - access grants
   - chat responses
   - visual events


   DATA FLOW
   ----------------------------------------------------------

   filesystem.js
        ↓
   security.js / mrsmileProgress.js
        ↓
   read / access result
        ↓
   mrsmile event system


   IMPORTANT
   ----------------------------------------------------------
   Filesystem remains the source of truth for file existence.
========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    canAccess
} from "./security.js";


import {
    isProgressUnlocked
} from "./mrsmileProgress.js";


import {
    trigger
} from "./eventManager.js";


/* ==========================================================
   FILESYSTEM DATA
========================================================== */

const filesystem = {

    "/": {

        type:
            "dir",

        content: {

            "files": {

                type:
                    "dir",

                content: {


                    /* ======================================
                       PUBLIC
                    ====================================== */

                    "readme.txt": {

                        type:
                            "file",

                        data:
`OMEGA SYSTEM
PUBLIC INFORMATION

Welcome.`,

                        level:
                            0

                    },


                    /* ======================================
                       INTERNAL
                    ====================================== */

                    "memo.txt": {

                        type:
                            "file",

                        data:
`OMEGA INTERNAL MEMO

Operator notes:
System instability detected.

Several archived records have become inaccessible.

Further investigation required.`,

                        level:
                            1

                    },


                    /* ======================================
                       MR.SMILE
                    ====================================== */

                    "entity_mrsmile.txt": {

                        type:
                            "file",

                        data:
`ENTITY: MR.SMILE

WARNING

DO NOT ENGAGE.

DO NOT RESPOND TO DIRECT COMMUNICATION.

DO NOT ATTEMPT TO IDENTIFY THE ENTITY.`,

                        level:
                            2

                    },


                    /* ======================================
                       HIDDEN MIRROR ARCHIVE
                    ====================================== */

                    "mirror_archive.txt": {

                        type:
                            "external",

                        hidden:
                            true,

                        unlockFlag:
                            "archive",

                        path:
                            "files/mirror_archive.txt",

                        level:
                            2

                    },


                    /* ======================================
                       REAL PDF FILES
                    ====================================== */

                    "experiment_Ten.pdf": {

                        type:
                            "external",

                        path:
                            "files/experiment_Ten.pdf",

                        level:
                            5

                    },


                    "experiment_Alexey.pdf": {

                        type:
                            "external",

                        path:
                            "files/experiment_Alexey.pdf",

                        level:
                            4

                    }

                }

            }

        }

    }

};


/* ==========================================================
   PATH NORMALIZATION
========================================================== */

function normalizePath(path) {

    if (
        typeof path !==
        "string" ||
        path.trim() === ""
    ) {

        return "/";

    }


    let normalized =
        path.trim();


    /*
       Windows-style path → OMEGA path
    */

    normalized =
        normalized.replace(
            /\\/g,
            "/"
        );


    /*
       Ensure leading slash
    */

    if (
        !normalized.startsWith("/")
    ) {

        normalized =
            "/" +
            normalized;

    }


    /*
       Remove duplicate slashes
    */

    normalized =
        normalized.replace(
            /\/+/g,
            "/"
        );


    /*
       Remove trailing slash
       except root
    */

    if (
        normalized.length > 1 &&
        normalized.endsWith("/")
    ) {

        normalized =
            normalized.slice(
                0,
                -1
            );

    }


    return normalized;

}


/* ==========================================================
   GET NODE
========================================================== */

function getNode(path) {

    const normalizedPath =
        normalizePath(
            path
        );


    const parts =
        normalizedPath
            .split("/")
            .filter(Boolean);


    let current =
        filesystem["/"];


    for (
        const part
        of parts
    ) {

        if (
            !current
        ) {

            return null;

        }


        if (
            !current.content
        ) {

            return null;

        }


        if (
            !Object.prototype.hasOwnProperty.call(
                current.content,
                part
            )
        ) {

            return null;

        }


        current =
            current.content[
                part
            ];

    }


    return current;

}


/* ==========================================================
   CHECK HIDDEN ACCESS
========================================================== */

function isHiddenUnlocked(node) {

    if (
        !node
    ) {

        return false;

    }


    /*
       Normal visible item
    */

    if (
        node.hidden !== true
    ) {

        return true;

    }


    /*
       Hidden item without
       an unlock condition
    */

    if (
        !node.unlockFlag
    ) {

        return false;

    }


    return isProgressUnlocked(
        node.unlockFlag
    );

}


/* ==========================================================
   SECURITY ACCESS
========================================================== */

function hasSecurityAccess(node) {

    if (
        !node
    ) {

        return false;

    }


    /*
       Directories do not need
       file-level clearance here.
    */

    if (
        node.type ===
        "dir"
    ) {

        return true;

    }


    return canAccess(
        node.level ||
        0
    );

}


/* ==========================================================
   CAN LIST ITEM
========================================================== */

function canListItem(item) {

    if (
        !item
    ) {

        return false;

    }


    return (
        isHiddenUnlocked(
            item
        )
    );

}


/* ==========================================================
   LIST DIRECTORY
========================================================== */

export function listFiles(
    path = "/"
) {

    const normalizedPath =
        normalizePath(
            path
        );


    const node =
        getNode(
            normalizedPath
        );


    if (
        !node
    ) {

        return [];

    }


    if (
        node.type !==
        "dir"
    ) {

        return [];

    }


    return Object.keys(
        node.content ||
        {}
    ).filter(
        name =>
            canListItem(
                node.content[
                    name
                ]
            )
    );

}


/* ==========================================================
   FILE ACCESS EVENT
========================================================== */

function emitFileReadEvent(
    path,
    node
) {

    const normalizedPath =
        normalizePath(
            path
        );


    const payload = {

        path:
            normalizedPath,

        file:
            node,

        fileName:
            normalizedPath
                .split("/")
                .pop() ||
            "",

        type:
            node?.type ||
            null,

        restricted:
            Boolean(
                node &&
                Number(
                    node.level ||
                    0
                ) > 0
            ),

        external:
            node?.type ===
            "external",

        timestamp:
            Date.now()

    };


    /*
       Canonical event.
       This is what the new
       mrsmileEvents.js listens for.
    */

    trigger(
        "mrsmile:operatorFileRead",
        payload
    );


    /*
       Legacy compatibility.
       Keeps older listeners working
       during the transition.
    */

    trigger(
        "mrsmile:operatorReadFile",
        payload
    );


    /*
       Extra semantic event for
       external resources.
    */

    if (
        node?.type ===
        "external"
    ) {

        trigger(
            "mrsmile:externalFileRead",
            payload
        );

    }


    /*
       Restricted file event.
    */

    if (
        payload.restricted
    ) {

        trigger(
            "mrsmile:restrictedFileOpened",
            payload
        );

    }

}


/* ==========================================================
   READ VIRTUAL FILE
========================================================== */

export function readFile(
    path
) {

    const normalizedPath =
        normalizePath(
            path
        );


    const node =
        getNode(
            normalizedPath
        );


    if (
        !node
    ) {

        return null;

    }


    /*
       Directories cannot be read
       as files.
    */

    if (
        node.type ===
        "dir"
    ) {

        return null;

    }


    /*
       Hidden access.
    */

    if (
        !isHiddenUnlocked(
            node
        )
    ) {

        trigger(
            "mrsmile:fileAccessDenied",
            {

                path:
                    normalizedPath,

                file:
                    node,

                reason:
                    "hidden",

                timestamp:
                    Date.now()

            }
        );


        return "ACCESS DENIED";

    }


    /*
       Security clearance.
    */

    if (
        !hasSecurityAccess(
            node
        )
    ) {

        trigger(
            "mrsmile:fileAccessDenied",
            {

                path:
                    normalizedPath,

                file:
                    node,

                reason:
                    "security",

                level:
                    node.level ||
                    0,

                timestamp:
                    Date.now()

            }
        );


        return "ACCESS DENIED";

    }


    /*
       External files do not contain
       inline text.

       Return their external path
       in a structured object so
       filesystem users can decide
       how to load them.
    */

    if (
        node.type ===
        "external"
    ) {

        emitFileReadEvent(
            normalizedPath,
            node
        );


        return {

            type:
                "external",

            path:
                node.path ||
                null,

            level:
                node.level ||
                0,

            data:
                null

        };

    }


    /*
       Normal virtual text file.
    */

    if (
        node.type ===
        "file"
    ) {

        emitFileReadEvent(
            normalizedPath,
            node
        );


        return node.data ??
            "";

    }


    return null;

}


/* ==========================================================
   GET FILE / NODE
========================================================== */

export function getFile(
    path
) {

    const normalizedPath =
        normalizePath(
            path
        );


    const node =
        getNode(
            normalizedPath
        );


    if (
        !node
    ) {

        return null;

    }


    /*
       Hidden item not unlocked.
    */

    if (
        !isHiddenUnlocked(
            node
        )
    ) {

        return {

            type:
                "denied",

            reason:
                "hidden"

        };

    }


    /*
       Security denied.
    */

    if (
        !hasSecurityAccess(
            node
        )
    ) {

        return {

            type:
                "denied",

            reason:
                "security"

        };

    }


    return {

        ...node,

        path:
            normalizedPath

    };

}


/* ==========================================================
   FILE EXISTS
========================================================== */

export function fileExists(
    path
) {

    return (
        getNode(
            normalizePath(
                path
            )
        ) !== null
    );

}


/* ==========================================================
   DIRECTORY CHECK
========================================================== */

export function isDirectory(
    path
) {

    const node =
        getNode(
            normalizePath(
                path
            )
        );


    return (
        node !== null &&
        node.type ===
        "dir"
    );

}


/* ==========================================================
   FILE CHECK
========================================================== */

export function isFile(
    path
) {

    const node =
        getNode(
            normalizePath(
                path
            )
        );


    return (
        node !== null &&
        (
            node.type ===
            "file" ||
            node.type ===
            "external"
        )
    );

}


/* ==========================================================
   EXTERNAL FILE CHECK
========================================================== */

export function isExternalFile(
    path
) {

    const node =
        getNode(
            normalizePath(
                path
            )
        );


    return (
        node !== null &&
        node.type ===
        "external"
    );

}


/* ==========================================================
   GET EXTERNAL FILE PATH
========================================================== */

export function getExternalFilePath(
    path
) {

    const node =
        getNode(
            normalizePath(
                path
            )
        );


    if (
        !node ||
        node.type !==
        "external"
    ) {

        return null;

    }


    if (
        !isHiddenUnlocked(
            node
        )
    ) {

        return null;

    }


    if (
        !hasSecurityAccess(
            node
        )
    ) {

        return null;

    }


    return (
        node.path ||
        null
    );

}


/* ==========================================================
   DEBUG ACCESS
========================================================== */

export function getFilesystemStatus() {

    return {

        root:
            "/",

        rootFiles:
            listFiles(
                "/files"
            ),

        timestamp:
            Date.now()

    };

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    listFiles,

    readFile,

    getFile,

    fileExists,

    isDirectory,

    isFile,

    isExternalFile,

    getExternalFilePath,

    getFilesystemStatus

};
