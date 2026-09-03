import { canAccess } from "./security.js";

import {
    isProgressUnlocked
} from "./mrsmileProgress.js";


/* =========================================================
   OMEGA VIRTUAL FILESYSTEM
========================================================= */

const filesystem = {

    "/": {

        type: "dir",

        content: {

            "files": {

                type: "dir",

                content: {

                    "readme.txt": {

                        type: "file",

                        data:
`OMEGA SYSTEM
PUBLIC INFORMATION

Welcome.`,

                        level: 0

                    },


                    "memo.txt": {

                        type: "file",

                        data:
`OMEGA INTERNAL MEMO

Operator notes:
System instability detected.

Several archived records have become inaccessible.

Further investigation required.`,

                        level: 1

                    },


                    "entity_mrsmile.txt": {

                        type: "file",

                        data:
`ENTITY: MR.SMILE

WARNING

DO NOT ENGAGE.

DO NOT RESPOND TO DIRECT COMMUNICATION.

DO NOT ATTEMPT TO IDENTIFY THE ENTITY.`,

                        level: 2

                    },
                   "mirror_archive.txt": {
                       type: "file",

                       hidden: true,

                       unlockFlag: "archive",

                       data:
`OMEGA // RESTRICTED ARCHIVE

ARCHIVE ID: MIRROR-00

STATUS: PARTIALLY RECOVERED

The Mirror was not created as a communication system.

It was created as a containment environment.

Further information has been removed.

NOTE:

If this document is visible,
the restriction has already failed.`,

    level: 2
},


                    /* =====================================
                       REAL PDF FILES
                    ===================================== */

                    "experiment_Ten.pdf": {

                        type: "external",

                        path: "files/experiment_Ten.pdf",

                        level: 5

                    },


                    "experiment_Alexey.pdf": {

                        type: "external",

                        path: "files/experiment_Alexey.pdf",

                        level: 4

                    }

                }

            }

        }

    }

};


/* =========================================================
   LIST DIRECTORY
========================================================= */

export function listFiles(path = "/") {

    const node = getNode(path);

    if (!node)
        return [];

    if (node.type !== "dir")
        return [];

    return Object.keys(node.content || {})
        .filter(name => {

            const file =
                node.content[name];

            // Обычные файлы видны всегда
            if (!file.hidden)
                return true;

            // Скрытый файл проверяет разблокировку
            if (file.unlockFlag) {

                return isProgressUnlocked(
                    file.unlockFlag
                );

            }

            return false;

        });

}

/* =========================================================
   READ INTERNAL TEXT FILE
========================================================= */

export function readFile(path) {

    const node =
        getNode(path);

    if (!node)
        return null;

    if (node.type !== "file")
        return null;


    // ===================================
    // HIDDEN CONTENT
    // ===================================

    if (node.hidden) {

        if (!node.unlockFlag)
            return "ACCESS DENIED";

        if (
            !isProgressUnlocked(
                node.unlockFlag
            )
        ) {

            return "ACCESS DENIED";

        }

    }


    // ===================================
    // SECURITY LEVEL
    // ===================================

    if (
        !canAccess(
            node.level || 0
        )
    ) {

        return "ACCESS DENIED";

    }


    return node.data;

}

/* =========================================================
   GET FILE
========================================================= */

export function getFile(path) {

    const node = getNode(path);

    if (!node) {
        return null;
    }


    /* -----------------------------------------
       HIDDEN CONTENT
    ----------------------------------------- */

    if (node.hidden) {

        if (!node.unlockFlag) {

            return {
                type: "denied"
            };

        }

        if (
            !isProgressUnlocked(
                node.unlockFlag
            )
        ) {

            return {
                type: "denied"
            };

        }

    }


    /* -----------------------------------------
       SECURITY
    ----------------------------------------- */

    if (
        (
            node.type === "file" ||
            node.type === "external"
        )
        &&
        !canAccess(node.level || 0)
    ) {

        return {
            type: "denied"
        };

    }


    return node;

}


/* =========================================================
   INTERNAL NODE SEARCH
========================================================= */

function getNode(path) {

    if (!path) {
        return null;
    }

    const parts =
        path
            .split("/")
            .filter(Boolean);

    let current = filesystem["/"];


    for (const part of parts) {

        if (!current.content) {
            return null;
        }

        if (!current.content[part]) {
            return null;
        }

        current =
            current.content[part];

    }


    return current;

}
