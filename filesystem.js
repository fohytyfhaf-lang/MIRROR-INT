import {
    listFiles,
    readFile,
    getFile
} from "./filesystem.js";

let currentExplorerPath = "/files";


/* =========================================================
   RENDER EXPLORER
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

    if (!items || items.length === 0) {

        view.innerHTML = `
            <div class="emptyFolder">
                EMPTY FOLDER
            </div>
        `;

        return;
    }

    view.innerHTML = items.map(item => {

        const fullPath =
            path === "/"
                ? "/" + item
                : path + "/" + item;

        const node = getFile(fullPath);

        let icon = "📄";

        /* ---------- DIRECTORY ---------- */

        if (node?.type === "dir") {
            icon = "📁";
        }

        /* ---------- EXTERNAL FILE ---------- */

        if (node?.type === "external") {

            const extension =
                item.split(".").pop().toLowerCase();

            if (extension === "pdf") {
                icon = "📕";
            }

            else if (
                extension === "mp4" ||
                extension === "webm" ||
                extension === "ogg"
            ) {
                icon = "📹";
            }

            else if (
                extension === "png" ||
                extension === "jpg" ||
                extension === "jpeg" ||
                extension === "webp"
            ) {
                icon = "🖼";
            }
        }

        /* ---------- DENIED ---------- */

        if (node?.type === "denied") {
            icon = "🔒";
        }

        return `
            <div
                class="explorerItem"
                data-path="${escapeAttribute(fullPath)}">

                <span class="explorerIcon">
                    ${icon}
                </span>

                <span class="explorerName">
                    ${escapeHtml(item)}
                </span>
            </div>
        `;

    }).join("");

    /* =====================================================
       CLICK EVENTS
    ===================================================== */

    view.querySelectorAll(".explorerItem").forEach(item => {

        item.addEventListener("click", () => {

            const path =
                item.dataset.path;

            openExplorerItem(path);

        });

    });
}


/* =========================================================
   OPEN FILE / DIRECTORY
========================================================= */

function openExplorerItem(path) {

    const node = getFile(path);

    if (!node) {

        console.warn(
            "OMEGA FILE NOT FOUND:",
            path
        );

        return;
    }


    /* =====================================================
       ACCESS DENIED
    ===================================================== */

    if (node.type === "denied") {

        openDocumentWindow(
            path.split("/").pop()
        );

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


    /* =====================================================
       DIRECTORY
    ===================================================== */

    if (node.type === "dir") {

        renderExplorer(path);

        return;
    }


    /* =====================================================
       EXTERNAL FILE
    ===================================================== */

    if (node.type === "external") {

        openExternalFile(
            node.path,
            path
        );

        return;
    }


    /* =====================================================
       INTERNAL TEXT FILE
    ===================================================== */

    if (node.type === "file") {

        openDocumentWindow(
            path.split("/").pop()
        );

        const content =
            document.getElementById("documentContent");

        if (!content) return;

        const data =
            readFile(path);

        content.innerHTML = `
            <pre class="textDocument">${escapeHtml(data)}</pre>
        `;

        return;
    }
}


/* =========================================================
   EXTERNAL FILE HANDLER
========================================================= */

function openExternalFile(filePath, omegaPath) {

    const extension =
        filePath
            .split(".")
            .pop()
            .toLowerCase();


    /* =====================================================
       PDF
    ===================================================== */

    if (extension === "pdf") {

        openDocumentWindow(
            omegaPath.split("/").pop()
        );

        const content =
            document.getElementById("documentContent");

        if (!content) return;

        content.innerHTML = `
            <iframe
                class="omegaPdfViewer"
                src="${escapeAttribute(filePath)}"
                title="OMEGA PDF">
            </iframe>
        `;

        return;
    }


    /* =====================================================
       VIDEO
    ===================================================== */

    if (
        extension === "mp4" ||
        extension === "webm" ||
        extension === "ogg"
    ) {

        openVideoWindow(filePath);

        return;
    }


    /* =====================================================
       IMAGE
    ===================================================== */

    if (
        extension === "png" ||
        extension === "jpg" ||
        extension === "jpeg" ||
        extension === "webp"
    ) {

        openDocumentWindow(
            omegaPath.split("/").pop()
        );

        const content =
            document.getElementById("documentContent");

        if (!content) return;

        content.innerHTML = `
            <div class="omegaImageViewer">

                <img
                    src="${escapeAttribute(filePath)}"
                    alt="OMEGA FILE">

            </div>
        `;

        return;
    }


    /* =====================================================
       UNKNOWN
    ===================================================== */

    openDocumentWindow(
        omegaPath.split("/").pop()
    );

    const content =
        document.getElementById("documentContent");

    if (!content) return;

    content.innerHTML = `
        <div class="documentUnknown">

            <h2>UNKNOWN FILE TYPE</h2>

            <p>
                ${escapeHtml(filePath)}
            </p>

        </div>
    `;
}


/* =========================================================
   DOCUMENT WINDOW
========================================================= */

function openDocumentWindow(titleText = "DOCUMENT") {

    const win =
        document.getElementById("documentWindow");

    if (!win) {

        console.warn(
            "OMEGA: documentWindow not found"
        );

        return;
    }

    const title =
        document.getElementById("viewerTitle");

    if (title) {
        title.textContent = titleText;
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

        video.pause();

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

function goBack() {

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
}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.openExplorerItem =
    openExplorerItem;

window.goBack =
    goBack;


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


function escapeAttribute(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}


/* =========================================================
   ENTRY POINT
========================================================= */

export function openExplorer() {

    renderExplorer("/files");

}
