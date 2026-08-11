import { canAccess } from "./security.js";

/* =========================================================
   OMEGA REAL FILESYSTEM
========================================================= */

const filesystem = {

    "/": {
        type: "dir",

        content: {

            files: {
                type: "dir",

                content: {

                    /* =========================
                       OLD TEXT FILES
                    ========================= */

                    "readme.txt": {
                        type: "file",
                        data: "PUBLIC INFO",
                        level: 0
                    },

                    "memo.txt": {
                        type: "file",
                        data: "Operator notes: system unstable",
                        level: 1
                    },

                    "entity_mrsmile.txt": {
                        type: "file",
                        data: "DO NOT ENGAGE",
                        level: 2
                    },

                    /* =========================
                       RESEARCH
                    ========================= */

                    research: {

                        type: "dir",

                        content: {

                            "experiment_Ten.pdf": {
                                type: "external",
                                path: "files/research/experiment_Ten.pdf",
                                level: 1
                            }

                        }

                    },

                    /* =========================
                       PERSONNEL
                    ========================= */

                    personnel: {

                        type: "dir",

                        content: {

                            /* сюда потом добавим PDF */

                        }

                    },

                    /* =========================
                       CLASSIFIED
                    ========================= */

                    classified: {

                        type: "dir",

                        content: {

                            /* секретные документы */

                        }

                    },

                    /* =========================
                       VIDEOS
                    ========================= */

                    videos: {

                        type: "dir",

                        content: {

                            /* сюда потом добавим видео */

                        }

                    }

                }

            }

        }

    }

};


/* =========================================================
   LIST FILES
========================================================= */

export function listFiles(path = "/") {

    const node = getNode(path);

    if (!node || node.type !== "dir") {
        return [];
    }

    return Object.keys(node.content);

}


/* =========================================================
   READ FILE
========================================================= */

export function readFile(path) {

    const node = getNode(path);

    if (!node || node.type !== "file") {
        return null;
    }

    if (!canAccess(node.level || 0)) {
        return "ACCESS DENIED";
    }

    return node.data;

}


/* =========================================================
   GET FILE INFORMATION
========================================================= */

export function getFile(path) {

    const node = getNode(path);

    if (!node) {
        return null;
    }

    if (!canAccess(node.level || 0)) {
        return {
            type: "denied"
        };
    }

    return node;

}


/* =========================================================
   NODE SEARCH
========================================================= */

function getNode(path) {

    const parts = path
        .split("/")
        .filter(Boolean);

    let current = filesystem["/"];

    for (const part of parts) {

        if (!current.content[part]) {
            return null;
        }

        current = current.content[part];

    }

    return current;

}
