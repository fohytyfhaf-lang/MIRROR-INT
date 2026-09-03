import {
    listFiles,
    readFile,
    getFile
} from "./filesystem.js";

import {
    on
} from "./eventManager.js";

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

    console.log(
        "[OMEGA EXPLORER] PATH:",
        path
    );

    console.log(
        "[OMEGA EXPLORER] FILES:",
        items
    );

    if (!items.length) {

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

        if (node?.type === "dir") {
            icon = "📁";
        }

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
   MR.SMILE ARCHIVE UNLOCK
========================================================= */

on("mrsmile:archiveUnlocked", () => {

    console.log(
        "[OMEGA EXPLORER] MIRROR-00 unlocked. Refreshing filesystem..."
    );

    /*
       Если Explorer сейчас открыт —
       обновляем его немедленно.
    */

    const explorer =
        document.getElementById("filesList");

    if (!explorer) {
        return;
    }

    renderExplorer(
        currentExplorerPath
    );

});


/* =========================================================
   OPEN FILE / DIRECTORY
========================================================= */

function openExplorerItem(path) {

    console.log(
        "[OMEGA EXPLORER] OPEN:",
        path
    );

    const node = getFile(path);

    console.log(
        "[OMEGA EXPLORER] NODE:",
        node
    );


    if (!node) {

        console.warn(
            "[OMEGA EXPLORER] FILE NOT FOUND:",
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

        console.log(
            "[OMEGA EXPLORER] OPEN DIRECTORY:",
            path
        );

        renderExplorer(path);

        return;
    }


    /* =====================================================
       EXTERNAL FILE
    ===================================================== */

    if (node.type === "external") {

        console.log(
            "[OMEGA EXPLORER] OPEN EXTERNAL FILE:",
            node.path
        );

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

        console.log(
            "[OMEGA EXPLORER] OPEN TEXT FILE:",
            path
        );

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
   EXTERNAL FILE
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

        console.log(
            "[OMEGA EXPLORER] OPENING PDF:",
            filePath
        );

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
   TEXT FILE
===================================================== */

if (extension === "txt") {

    console.log(
        "[OMEGA EXPLORER] OPENING TXT:",
        filePath
    );

    openDocumentWindow(
        omegaPath.split("/").pop()
    );

    const content =
        document.getElementById("documentContent");

    if (!content) return;

    content.innerHTML = `
        <div class="documentLoading">
            READING DOCUMENT...
        </div>
    `;

    fetch(filePath)
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            return response.text();

        })
        .then(text => {

            content.innerHTML = `
                <pre class="textDocument">${escapeHtml(text)}</pre>
            `;

        })
        .catch(error => {

            console.error(
                "[OMEGA EXPLORER] TXT LOAD ERROR:",
                error
            );

            content.innerHTML = `
                <div class="documentUnknown">

                    <h2>FILE READ ERROR</h2>

                    <p>
                        Unable to read external document.
                    </p>

                </div>
            `;

        });

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

        console.log(
            "[OMEGA EXPLORER] OPENING VIDEO:",
            filePath
        );

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
            "[OMEGA] documentWindow NOT FOUND"
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
            "[OMEGA] videoWindow NOT FOUND"
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
