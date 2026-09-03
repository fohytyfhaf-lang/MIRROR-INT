// =======================================
// OMEGA VIRTUAL FILESYSTEM
// =======================================

import { canAccess } from "./security.js";

import {
    isProgressUnlocked
} from "./mrsmileProgress.js";


// =======================================
// FILESYSTEM DATA
// =======================================

const filesystem = {

    "/": {

        type: "dir",

        content: {

            "files": {

                type: "dir",

                content: {

                    // ===================================
                    // PUBLIC
                    // ===================================

                    "readme.txt": {

                        type: "file",

                        data:
`OMEGA SYSTEM
PUBLIC INFORMATION

Welcome.`,

                        level: 0

                    },


                    // ===================================
                    // INTERNAL
                    // ===================================

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


                    // ===================================
                    // MR.SMILE
                    // ===================================

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
                    // ===================================
                    // HIDDEN MIRROR ARCHIVE
                    // ===================================

                    "mirror_archive.txt": {

                     type: "external",

                     hidden: true,

                    unlockFlag: "archive",

                    path: "files/mirror_archive.txt",

                    level: 2

                    },
                   


                    // ===================================
                    // REAL PDF FILES
                    // ===================================

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


// =======================================
// LIST DIRECTORY
// =======================================

export function listFiles(path = "/") {

    const normalizedPath =
        normalizePath(path);

    const node =
        getNode(normalizedPath);

    if (!node) {

        return [];

    }

    if (node.type !== "dir") {

        return [];

    }

    return Object.keys(
        node.content || {}
    ).filter(name => {

        const item =
            node.content[name];

        return canListItem(item);

    });

}


// =======================================
// CHECK IF ITEM CAN BE LISTED
// =======================================

function canListItem(item) {

    if (!item) {

        return false;

    }

    // -----------------------------------
    // NORMAL FILE / DIRECTORY
    // -----------------------------------

    if (!item.hidden) {

        return true;

    }

    // -----------------------------------
    // HIDDEN ITEM
    // -----------------------------------

    if (!item.unlockFlag) {

        return false;

    }

    return isProgressUnlocked(
        item.unlockFlag
    );

}


// =======================================
// READ FILE
// =======================================

export function readFile(path) {

    const node =
        getNode(
            normalizePath(path)
        );

    if (!node) {

        return null;

    }

    if (node.type !== "file") {

        return null;

    }

    // -----------------------------------
    // HIDDEN ACCESS
    // -----------------------------------

    if (!isHiddenUnlocked(node)) {

        return "ACCESS DENIED";

    }

    // -----------------------------------
    // SECURITY ACCESS
    // -----------------------------------

    if (!hasSecurityAccess(node)) {

        return "ACCESS DENIED";

    }

    return node.data;

}


// =======================================
// GET FILE / NODE
// =======================================

export function getFile(path) {

    const node =
        getNode(
            normalizePath(path)
        );

    if (!node) {

        return null;

    }

    // -----------------------------------
    // HIDDEN ACCESS
    // -----------------------------------

    if (!isHiddenUnlocked(node)) {

        return {
            type: "denied"
        };

    }

    // -----------------------------------
    // SECURITY ACCESS
    // -----------------------------------

    if (!hasSecurityAccess(node)) {

        return {
            type: "denied"
        };

    }

    return node;

}


// =======================================
// CHECK HIDDEN ACCESS
// =======================================

function isHiddenUnlocked(node) {

    // Not hidden
    if (!node.hidden) {

        return true;

    }

    // Hidden but has no unlock condition
    if (!node.unlockFlag) {

        return false;

    }

    return isProgressUnlocked(
        node.unlockFlag
    );

}


// =======================================
// SECURITY ACCESS
// =======================================

function hasSecurityAccess(node) {

    // Directories don't require
    // file-level clearance here.
    if (node.type === "dir") {

        return true;

    }

    return canAccess(
        node.level || 0
    );

}


// =======================================
// GET NODE
// =======================================

function getNode(path) {

    const normalizedPath =
        normalizePath(path);

    const parts =
        normalizedPath
            .split("/")
            .filter(Boolean);

    let current =
        filesystem["/"];

    for (const part of parts) {

        if (!current) {

            return null;

        }

        if (!current.content) {

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
            current.content[part];

    }

    return current;

}


// =======================================
// NORMALIZE PATH
// =======================================

function normalizePath(path) {

    if (
        typeof path !== "string" ||
        path.trim() === ""
    ) {

        return "/";

    }

    let normalized =
        path.trim();

    // Backslashes → slashes
    normalized =
        normalized.replace(
            /\\/g,
            "/"
        );

    // Ensure leading slash
    if (!normalized.startsWith("/")) {

        normalized =
            "/" + normalized;

    }

    // Remove duplicate slashes
    normalized =
        normalized.replace(
            /\/+/g,
            "/"
        );

    // Remove trailing slash
    // except for root
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


// =======================================
// OPTIONAL DEBUG ACCESS
// =======================================

export function fileExists(path) {

    return (
        getNode(
            normalizePath(path)
        ) !== null
    );

}


// =======================================
// OPTIONAL DIRECTORY CHECK
// =======================================

export function isDirectory(path) {

    const node =
        getNode(
            normalizePath(path)
        );

    return (
        node !== null &&
        node.type === "dir"
    );

}


// =======================================
// OPTIONAL FILE CHECK
// =======================================

export function isFile(path) {

    const node =
        getNode(
            normalizePath(path)
        );

    return (
        node !== null &&
        (
            node.type === "file" ||
            node.type === "external"
        )
    );

}
