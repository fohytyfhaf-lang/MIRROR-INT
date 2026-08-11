import { canAccess } from "./security.js";

/* =========================================================
   OMEGA VIRTUAL FILESYSTEM
========================================================= */

const filesystem = {

    "/": {

        type: "dir",

        content: {

            files: {

                type: "dir",

                content: {

                    /* =====================================
                       PUBLIC FILE
                    ===================================== */

                    "readme.txt": {

                        type: "file",

                        data:
                            "OMEGA SYSTEM\n" +
                            "PUBLIC INFORMATION\n\n" +
                            "Access level: 0",

                        level: 0

                    },


                    /* =====================================
                       OPERATOR FILE
                    ===================================== */

                    "memo.txt": {

                        type: "file",

                        data:
                            "OPERATOR MEMORANDUM\n\n" +
                            "System instability detected.\n" +
                            "Further investigation required.",

                        level: 1

                    },


                    /* =====================================
                       MR.SMILE
                    ===================================== */

                    "entity_mrsmile.txt": {

                        type: "file",

                        data:
                            "OMEGA ENTITY RECORD\n\n" +
                            "DESIGNATION: MR.SMILE\n" +
                            "STATUS: UNKNOWN\n\n" +
                            "DO NOT ENGAGE.",

                        level: 2

                    },


                    /* =====================================
                       REAL PDF
                    ===================================== */

                    "experiment_Ten.pdf": {

                        type: "external",

                        path:
                            "files/experiment_Ten.pdf",

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

    return Object.keys(node.content);

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
   GET FILE / DIRECTORY
========================================================= */

export function getFile(path) {

    const node = getNode(path);

    if (!node) {
        return null;
    }


    /* -----------------------------------------
       SECURITY CHECK
    ----------------------------------------- */

    if (
        (
            node.type === "file" ||
            node.type === "external"
        ) &&
        !canAccess(node.level || 0)
    ) {

        return {
            type: "denied",
            level: node.level || 0
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

    let current =
        filesystem["/"];


    for (const part of parts) {

        if (
            !current.content ||
            !current.content[part]
        ) {

            return null;

        }

        current =
            current.content[part];

    }


    return current;

}


/* =========================================================
   OPTIONAL DEBUG
========================================================= */

export function getFilesystem() {

    return filesystem;

}
