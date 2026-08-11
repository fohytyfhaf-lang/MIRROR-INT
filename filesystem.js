import { canAccess } from "./security.js";


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
                        data: "OMEGA SYSTEM\nPUBLIC INFORMATION\n\nWelcome.",
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

                    /* =====================================
                       REAL PDF
                    ===================================== */

                    "experiment_Ten.pdf": {

                        type: "external",

                        path: "files/experiment_Ten.pdf",

                        level: 5

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

    if (!node) {
        return [];
    }

    if (node.type !== "dir") {
        return [];
    }

    return Object.keys(node.content || {});
}


/* =========================================================
   READ INTERNAL TEXT FILE
========================================================= */

export function readFile(path) {

    const node = getNode(path);

    if (!node) {
        return null;
    }

    if (node.type !== "file") {
        return null;
    }

    if (!canAccess(node.level || 0)) {
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
