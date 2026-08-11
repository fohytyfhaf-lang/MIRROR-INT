import {
    listFiles,
    readFile,
    getFile
} from "./filesystem.js";

let currentExplorerPath = "/files";


/* =========================================================
   INTERNAL RENDER
========================================================= */

function renderExplorer(path) {

    const view = document.getElementById("filesList");
    const pathBar = document.getElementById("pathBar");

    if (!view) return;

    currentExplorerPath = path;

    if (pathBar) {
        pathBar.textContent = path;
    }

    const items = listFiles(path);

    if (!items.length) {

        view.innerHTML = `
            <div class="emptyFolder">
                EMPTY FOLDER
            </div>
        `;

        return;
    }

    view.innerHTML = items.map(item => {

        const fullPath = path + "/" + item;

        const node = getFile(fullPath);

        let icon = "📄";

        if (node?.type === "dir") {
            icon = "📁";
        }

        if (node?.type === "external") {

            const extension =
                item.split(".").pop().toLowerCase();

            if (extension === "pdf") {
                icon = "📕";
            }

            if (
                extension === "mp4" ||
                extension === "webm" ||
                extension === "ogg"
            ) {
                icon = "📹";
            }

            if (
                extension === "png" ||
                extension === "jpg" ||
                extension === "jpeg" ||
                extension === "webp"
            ) {
                icon = "🖼";
            }

        }

        return `
            <div
                class="explorerItem"
                onclick="openExplorerItem('${fullPath}')">

                <span class="explorerIcon">
                    ${icon}
                </span>

                <span class="explorerName">
                    ${item}
                </span>

            </div>
        `;

    }).join("");

}


/* =========================================================
   OPEN FILE / DIRECTORY
========================================================= */

window.openExplorerItem = function(path) {

    const node = getFile(path);

    if (!node) {

        console.warn(
            "OMEGA FILE NOT FOUND:",
            path
        );

        return;
    }


    /* =========================================
       ACCESS DENIED
    ========================================= */

    if (node.type === "denied") {

        openDocumentWindow();

        const content =
            document.getElementById("documentContent");

        if (content) {

            content.innerHTML = `
                <div class="documentDenied">

                    <div class="deniedIcon">
                        🔒
                    </div>

                    <h2>ACCESS DENIED</h2>

                    <p>
                        Insufficient clearance level.
                    </p>

                    <p>
                        OMEGA SECURITY SYSTEM
                    </p>

                </div>
            `;

        }

        return;
    }


    /* =========================================
       DIRECTORY
    ========================================= */

    if (node.type === "dir") {

        renderExplorer(path);

        return;
    }


    /* =========================================
       REAL EXTERNAL FILE
    ========================================= */

    if (node.type === "external") {

        openExternalFile(
            node.path,
            path
        );

        return;
    }


    /* =========================================
       OLD INTERNAL TEXT FILE
    ========================================= */

    if (node.type === "file") {

        openDocumentWindow();

        const content =
            document.getElementById("documentContent");

        if (!content) return;

        const data =
            readFile(path);

        content.innerHTML = `
            <pre class="textDocument">
${escapeHtml(data)}
            </pre>
        `;

    }

};


/* =========================================================
   REAL FILE HANDLER
========================================================= */

function openExternalFile(filePath, omegaPath) {

    const extension =
        filePath
            .split(".")
            .pop()
            .toLowerCase();


    /* =========================================
       PDF
    ========================================= */

    if (extension === "pdf") {

        openDocumentWindow();

        const title =
            document.getElementById("viewerTitle");

        const content =
            document.getElementById("documentContent");

        if (title) {

            title.textContent =
                omegaPath.split("/").pop();

        }

        if (content) {

            content.innerHTML = `

                <iframe
                    class="omegaPdfViewer"
                    src="${filePath}">
                </iframe>

            `;

        }

        return;
    }


    /* =========================================
       VIDEO
    ========================================= */

    if (
        extension === "mp4" ||
        extension === "webm" ||
        extension === "ogg"
    ) {

        openVideoWindow(filePath);

        return;
    }


    /* =========================================
       IMAGE
    ========================================= */

    if (
        extension === "png" ||
        extension === "jpg" ||
        extension === "jpeg" ||
        extension === "webp"
    ) {

        openDocumentWindow();

        const content =
            document.getElementById("documentContent");

        if (content) {

            content.innerHTML = `

                <div class="omegaImageViewer">

                    <img
                        src="${filePath}"
                        alt="OMEGA FILE">

                </div>

            `;

        }

        return;
    }


    /* =========================================
       UNKNOWN
    ========================================= */

    openDocumentWindow();

    const content =
        document.getElementById("documentContent");

    if (content) {

        content.innerHTML = `

            <div class="documentUnknown">

                <h2>UNKNOWN FILE TYPE</h2>

                <p>
                    ${filePath}
                </p>

            </div>

        `;

    }

}


/* =========================================================
   DOCUMENT WINDOW
========================================================= */

function openDocumentWindow() {

    const win =
        document.getElementById("documentWindow");

    if (!win) {

        console.warn(
            "OMEGA: documentWindow not found"
        );

        return;
    }

    win.classList.remove("hidden");
    win.style.display = "flex";

    if (window.bringToFront) {

        window.bringToFront(win);

    }

}


/* =========================================================
   VIDEO WINDOW
========================================================= */

function openVideoWindow(filePath) {

    const win =
        document.getElementById("videoWindow");

    if (!win) {

        console.warn(
            "OMEGA: videoWindow not found"
        );

        return;
    }

    const video =
        document.getElementById("omegaVideo");

    if (video) {

        video.src = filePath;

        video.load();

    }

    win.classList.remove("hidden");
    win.style.display = "flex";

    if (window.bringToFront) {

        window.bringToFront(win);

    }

}


/* =========================================================
   BACK
========================================================= */

window.goBack = function() {

    if (currentExplorerPath === "/files") {
        return;
    }

    const parts =
        currentExplorerPath
            .split("/")
            .filter(Boolean);

    parts.pop();

    const newPath =
        "/" + parts.join("/");

    renderExplorer(
        newPath || "/files"
    );

};


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   ENTRY POINT
========================================================= */

export function openExplorer() {

    renderExplorer("/files");

}

// =========================================================
// GET FILE / NODE
// =========================================================

export function getFile(path) {

    const node = getNode(path);

    if (!node) {
        return null;
    }

    // Проверяем доступ
    if (
        node.type === "file" &&
        !canAccess(node.level || 0)
    ) {
        return {
            type: "denied"
        };
    }

    return node;
}
