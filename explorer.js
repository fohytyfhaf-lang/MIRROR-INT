/* =========================================================
   OMEGA EXPLORER
   Filesystem Browser + MR.SMILE Context Integration
========================================================= */

import {
    listFiles,
    readFile,
    getFile
} from "./filesystem.js";

import {
    on,
    trigger
} from "./eventManager.js";


/* =========================================================
   STATE
========================================================= */

let currentExplorerPath = "/files";
const EXPLORER_PAGE_SIZE = 10;

let currentExplorerPage = 1;
let selectedExplorerPath = null;


/* =========================================================
   MR.SMILE CONTEXT
========================================================= */

/*
    Explorer does NOT decide what MR.SMILE should do.

    It only reports what the operator actually did.

    Flow:

        Explorer
            ↓
        operatorAction
            ↓
        mrsmileContext
            ↓
        mrsmileBehavior
            ↓
        decision
            ↓
        mrsmileActions
*/


function reportMrSmileAction(data = {}) {

    try {

        trigger(
            "mrsmile:operatorAction",
            {
                source: "explorer",
                page: "files",

                operator:
                    data.operator ||
                    "operator",

                ...data
            }
        );

    } catch (error) {

        console.warn(
            "[OMEGA EXPLORER] MR.SMILE context report failed:",
            error
        );

    }

}

function getExplorerFileSize(node) {
    if (!node) return "UNKNOWN";

    if (node.size) {
        return typeof node.size === "number"
            ? `${(node.size / 1024).toFixed(1)} KB`
            : String(node.size);
    }

    if (node.type === "dir") {
        return "DIRECTORY";
    }

    const name = node.name || "";
    const extension = getExtension(name);

    const defaultSizes = {
        txt: "4.2 KB",
        pdf: "18.4 KB",
        mp4: "24.8 MB",
        webm: "18.2 MB",
        ogg: "3.1 MB",
        png: "1.8 MB",
        jpg: "1.6 MB",
        jpeg: "1.6 MB",
        webp: "1.2 MB"
    };

    return defaultSizes[extension] || "UNKNOWN";
}

function getExplorerFileType(node, name = "") {
    if (!node) return "UNKNOWN";

    if (node.type === "dir") {
        return "DIRECTORY";
    }

    const extension = getExtension(name || node.name || "");

    const types = {
        txt: "TEXT DOCUMENT",
        pdf: "PDF DOCUMENT",
        mp4: "VIDEO",
        webm: "VIDEO",
        ogg: "AUDIO",
        png: "IMAGE",
        jpg: "IMAGE",
        jpeg: "IMAGE",
        webp: "IMAGE"
    };

    return types[extension] || "FILE";
}

function ensureExplorerTools() {
    const filesList = document.getElementById("filesList");
    if (!filesList) return;

    if (!document.getElementById("explorerMetaBar")) {
        const metaBar = document.createElement("div");
        metaBar.id = "explorerMetaBar";

        metaBar.innerHTML = `
            <div class="explorerSelectionInfo">
                <div class="explorerSelectionTitle">
                    SELECTED <span id="explorerSelectedName">NONE</span>
                </div>

                <div id="explorerSelectedMeta" class="explorerSelectionMeta">
                    SELECT A FILE
                </div>
            </div>

            <button id="explorerInfoButton" class="explorerInfoButton" type="button">
                INFO
            </button>
        `;

        filesList.parentElement.insertBefore(metaBar, filesList);

        document
            .getElementById("explorerInfoButton")
            .addEventListener("click", () => {
                if (selectedExplorerPath) {
                    openFileInfo(selectedExplorerPath);
                }
            });
    }

    if (!document.getElementById("explorerPagination")) {
        const pagination = document.createElement("div");
        pagination.id = "explorerPagination";

        pagination.innerHTML = `
            <div id="explorerPageStatus">
                ENTRIES 00–00 / 00
            </div>

            <div id="explorerPageControls">
                <button id="explorerPrevButton" type="button">&lt;</button>
                <span id="explorerPageNumber">PAGE 01 / 01</span>
                <button id="explorerNextButton" type="button">&gt;</button>
            </div>
        `;

        filesList.parentElement.insertBefore(pagination, filesList);

        document
            .getElementById("explorerPrevButton")
            .addEventListener("click", () => {
                if (currentExplorerPage > 1) {
                    currentExplorerPage--;
                    renderExplorer(currentExplorerPath, true);
                }
            });

        document
            .getElementById("explorerNextButton")
            .addEventListener("click", () => {
                const items = listFiles(currentExplorerPath);
                const totalPages = Math.max(
                    1,
                    Math.ceil(items.length / EXPLORER_PAGE_SIZE)
                );

                if (currentExplorerPage < totalPages) {
                    currentExplorerPage++;
                    renderExplorer(currentExplorerPath, true);
                }
            });
    }
}

function updateExplorerSelection(path) {
    selectedExplorerPath = path;

    document.querySelectorAll(".explorerItem").forEach(item => {
        item.classList.toggle(
            "selected",
            item.dataset.path === path
        );
    });

    const nameElement = document.getElementById("explorerSelectedName");
    const metaElement = document.getElementById("explorerSelectedMeta");

    if (!nameElement || !metaElement) return;

    const node = getFile(path);

    if (!node) {
        nameElement.textContent = "NONE";
        metaElement.textContent = "SELECT A FILE";
        return;
    }

    const name = node.name || path.split("/").pop();

    nameElement.textContent = name;

    metaElement.textContent =
        `${getExplorerFileType(node, name)} · ` +
        `${getExplorerFileSize(node)} · ` +
        `LEVEL ${node.level ?? 0}`;
}

function openFileInfo(path) {
    const node = getFile(path);

    if (!node) return;

    const name = node.name || path.split("/").pop();
    const type = getExplorerFileType(node, name);
    const size = getExplorerFileSize(node);

    const overlay = document.createElement("div");
    overlay.className = "explorerInfoOverlay";

    const metadata = [
        ["PATH", path],
        ["TYPE", type],
        ["SIZE", size],
        ["VERSION", node.version || "1.0"],
        ["CHECKSUM", node.checksum || "UNAVAILABLE"],
        ["ACCESS LEVEL", node.level ?? 0],
        ["CREATED", node.created || "UNKNOWN"],
        ["MODIFIED", node.modified || "UNKNOWN"],
        ["MODIFIED BY", node.modifiedBy || "SYSTEM"],
        ["LAST ACCESS", node.lastAccess || "UNKNOWN"]
    ];

    overlay.innerHTML = `
        <div class="explorerInfoPanel">

            <div class="explorerInfoHeader">
                <span>FILE INFORMATION</span>
                <button type="button" class="explorerInfoClose">✕</button>
            </div>

            <div class="explorerInfoFileName">
                ${escapeHtml(name)}
            </div>

            <div class="explorerInfoGrid">
                ${metadata.map(([label, value]) => `
                    <div class="explorerInfoLabel">
                        ${escapeHtml(label)}
                    </div>

                    <div class="explorerInfoValue">
                        ${escapeHtml(String(value))}
                    </div>
                `).join("")}
            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
        overlay.remove();
    };

    overlay
        .querySelector(".explorerInfoClose")
        .addEventListener("click", close);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            close();
        }
    });
}


/* =========================================================
   RENDER EXPLORER
========================================================= */
function renderExplorer(path, preservePage = false) {
    const list = document.getElementById("filesList");
    const pathBar = document.getElementById("pathBar");

    if (!list || !pathBar) return;

    if (path !== currentExplorerPath) {
        currentExplorerPage = 1;
        selectedExplorerPath = null;
    } else if (!preservePage) {
        currentExplorerPage = 1;
    }

    currentExplorerPath = path;

    pathBar.textContent = path;

    ensureExplorerTools();

    const items = listFiles(path);

    const totalPages = Math.max(
        1,
        Math.ceil(items.length / EXPLORER_PAGE_SIZE)
    );

    if (currentExplorerPage > totalPages) {
        currentExplorerPage = totalPages;
    }

    const startIndex =
        (currentExplorerPage - 1) * EXPLORER_PAGE_SIZE;

    const visibleItems = items.slice(
        startIndex,
        startIndex + EXPLORER_PAGE_SIZE
    );


    console.log(
        "[OMEGA EXPLORER] PATH:",
        path
    );

    console.log(
        "[OMEGA EXPLORER] FILES:",
        items
    );


    /* -----------------------------------------------------
       EMPTY FOLDER
    ----------------------------------------------------- */

    if (!items.length) {

      list.innerHTML = `
            <div class="emptyFolder">
                EMPTY FOLDER
            </div>
        `;

        return;

    }


    /* -----------------------------------------------------
       RENDER ITEMS
    ----------------------------------------------------- */

    list.innerHTML =
    visibleItems.map(item => {
       
            const fullPath =
                path === "/"
                    ? "/" + item
                    : path + "/" + item;


            const node =
                getFile(fullPath);


            let icon = "📄";


            /* ------------------------------------------------
               DIRECTORY
            ------------------------------------------------ */

            if (
                node?.type === "dir"
            ) {

                icon = "📁";

            }


            /* ------------------------------------------------
               EXTERNAL
            ------------------------------------------------ */

            if (
                node?.type === "external"
            ) {

                const extension =
                    getExtension(item);


                if (
                    extension === "pdf"
                ) {

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

                else if (
                    extension === "txt"
                ) {

                    icon = "📄";

                }

            }


            /* ------------------------------------------------
               DENIED
            ------------------------------------------------ */

            if (
                node?.type === "denied"
            ) {

                icon = "🔒";

            }


            return `
                <div
                    class="explorerItem"
                    data-path="${escapeAttribute(fullPath)}"
                    data-type="${escapeAttribute(node?.type || "unknown")}"
                >

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

list
    .querySelectorAll(".explorerItem")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const path =
                        item.dataset.path;

                   updateExplorerSelection(
                        path
                   );


                    openExplorerItem(
                        path
                    );

                }
            );

        });

}


/* =========================================================
   MR.SMILE ARCHIVE UNLOCK
========================================================= */

on(
    "mrsmile:archiveUnlocked",
    () => {

        console.log(
            "[OMEGA EXPLORER] MIRROR-00 unlocked. Refreshing filesystem..."
        );


        const explorer =
            document.getElementById("filesList");


        if (!explorer) {

            return;

        }


        renderExplorer(
            currentExplorerPath
        );

    }
);


/* =========================================================
   MR.SMILE GAME / TRUTH REFRESH
========================================================= */

on(
    "mrsmile:gameUnlocked",
    () => {

        console.log(
            "[OMEGA EXPLORER] Game access changed. Refreshing filesystem..."
        );


        if (
            document.getElementById("filesList")
        ) {

            renderExplorer(
                currentExplorerPath
            );

        }

    }
);


on(
    "mrsmile:truthUnlocked",
    () => {

        console.log(
            "[OMEGA EXPLORER] Truth access changed. Refreshing filesystem..."
        );


        if (
            document.getElementById("filesList")
        ) {

            renderExplorer(
                currentExplorerPath
            );

        }

    }
);


/* =========================================================
   FIRST OMEGA SESSION
========================================================= */

on(
    "omega:firstSessionInitialized",
    () => {

        console.log(
            "[OMEGA EXPLORER] First session initialized. Refreshing filesystem..."
        );

        if (
            document.getElementById("filesList")
        ) {

            renderExplorer(
                currentExplorerPath
            );

        }

    }
);


/* =========================================================
   OPEN FILE / DIRECTORY
========================================================= */

function openExplorerItem(path) {

    console.log(
        "[OMEGA EXPLORER] OPEN:",
        path
    );


    const node =
        getFile(path);


    console.log(
        "[OMEGA EXPLORER] NODE:",
        node
    );


    /* =====================================================
       FILE NOT FOUND
    ===================================================== */

    if (!node) {

        console.warn(
            "[OMEGA EXPLORER] FILE NOT FOUND:",
            path
        );


        reportMrSmileAction({

            type: "file_open_failed",

            target: path,

            action: "open",

            reason: "file_not_found",

            metadata: {

                path,

                currentPath:
                    currentExplorerPath

            }

        });


        return;

    }


    const fileName =
        path
            .split("/")
            .pop();


    const extension =
        getExtension(fileName);


    /* =====================================================
       DIRECTORY
    ===================================================== */

    if (
        node.type === "dir"
    ) {

        console.log(
            "[OMEGA EXPLORER] OPEN DIRECTORY:",
            path
        );


        reportMrSmileAction({

            type: "folder_open",

            target: path,

            action: "open",

            reason: "operator_opened_folder",

            metadata: {

                path,

                name: fileName,

                itemType: "directory",

                previousPath:
                    currentExplorerPath,

                currentPath:
                    path

            }

        });


        renderExplorer(
            path
        );


        return;

    }


    /* =====================================================
       ACCESS DENIED
    ===================================================== */

    if (
        node.type === "denied"
    ) {

        console.log(
            "[OMEGA EXPLORER] ACCESS DENIED:",
            path
        );


        reportMrSmileAction({

            type: "restricted_file",

            target: fileName,

            action: "open",

            reason: "operator_attempted_restricted_file",

            metadata: {

                path,

                name: fileName,

                extension,

                itemType: "denied",

                currentPath:
                    currentExplorerPath,

                clearanceRequired:
                    node.clearance ??
                    node.requiredClearance ??
                    null

            }

        });


        openDocumentWindow(
            fileName
        );


        const content =
            document.getElementById(
                "documentContent"
            );


        if (content) {

            content.innerHTML = `

                <div class="documentDenied">

                    <div class="deniedIcon">
                        🔒
                    </div>

                    <h2>
                        ACCESS DENIED
                    </h2>

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
       EXTERNAL FILE
    ===================================================== */

    if (
        node.type === "external"
    ) {

        console.log(
            "[OMEGA EXPLORER] OPEN EXTERNAL FILE:",
            node.path
        );


        reportMrSmileAction({

            type:
                getExternalContextType(
                    extension
                ),

            target:
                fileName,

            action:
                "open",

            reason:
                "operator_opened_external_file",

            metadata: {

                path,

                externalPath:
                    node.path,

                name:
                    fileName,

                extension,

                itemType:
                    "external",

                currentPath:
                    currentExplorerPath

            }

        });


        openExternalFile(
            node.path,
            path
        );


        return;

    }


    /* =====================================================
       INTERNAL TEXT FILE
    ===================================================== */

    if (
        node.type === "file"
    ) {

        console.log(
            "[OMEGA EXPLORER] OPEN TEXT FILE:",
            path
        );


        reportMrSmileAction({

            type:
                isRestrictedPath(path)
                    ? "restricted_file"
                    : "file_open",

            target:
                fileName,

            action:
                "open",

            reason:
                "operator_opened_internal_file",

            metadata: {

                path,

                name:
                    fileName,

                extension:
                    extension || "txt",

                itemType:
                    "internal_file",

                currentPath:
                    currentExplorerPath,

                restricted:
                    isRestrictedPath(path)

            }

        });


        openDocumentWindow(
            fileName
        );


        const content =
            document.getElementById(
                "documentContent"
            );


        if (!content) {

            return;

        }


        const data =
            readFile(path);

       reportMrSmileAction({

    type:
        "file_read",

    target:
        fileName,

    action:
        "read",

    reason:
        "operator_read_internal_file",

    metadata: {

        path,

        name:
            fileName,

        extension:
            extension || "txt",

        itemType:
            "internal_file",

        currentPath:
            currentExplorerPath

    }

});


        content.innerHTML = `

            <pre class="textDocument">${escapeHtml(data)}</pre>

        `;


        return;

    }

}


/* =========================================================
   EXTERNAL FILE
========================================================= */

function openExternalFile(
    filePath,
    omegaPath
) {

    const extension =
        getExtension(filePath);


    const fileName =
        omegaPath
            .split("/")
            .pop();


    /* =====================================================
       PDF
    ===================================================== */

    if (
        extension === "pdf"
    ) {

        console.log(
            "[OMEGA EXPLORER] OPENING PDF:",
            filePath
        );


        openDocumentWindow(
            fileName
        );


        const content =
            document.getElementById(
                "documentContent"
            );


        if (!content) {

            return;

        }


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
       TXT
    ===================================================== */

    if (
        extension === "txt"
    ) {

        console.log(
            "[OMEGA EXPLORER] OPENING TXT:",
            filePath
        );


        openDocumentWindow(
            fileName
        );


        const content =
            document.getElementById(
                "documentContent"
            );


        if (!content) {

            return;

        }


        content.innerHTML = `

            <div class="documentLoading">
                READING DOCUMENT...
            </div>

        `;


        fetch(filePath)

            .then(
                response => {

                    if (!response.ok) {

                        throw new Error(
                            `HTTP ${response.status}`
                        );

                    }


                    return response.text();

                }
            )

            .then(
                text => {

                    content.innerHTML = `

                        <pre class="textDocument">${escapeHtml(text)}</pre>

                    `;

                }
            )

            .catch(
                error => {

                    console.error(
                        "[OMEGA EXPLORER] TXT LOAD ERROR:",
                        error
                    );


                    content.innerHTML = `

                        <div class="documentUnknown">

                            <h2>
                                FILE READ ERROR
                            </h2>

                            <p>
                                Unable to read external document.
                            </p>

                        </div>

                    `;

                }
            );


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


        openVideoWindow(
            filePath
        );


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

        console.log(
            "[OMEGA EXPLORER] OPENING IMAGE:",
            filePath
        );


        openDocumentWindow(
            fileName
        );


        const content =
            document.getElementById(
                "documentContent"
            );


        if (!content) {

            return;

        }


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
        fileName
    );


    const content =
        document.getElementById(
            "documentContent"
        );


    if (!content) {

        return;

    }


    content.innerHTML = `

        <div class="documentUnknown">

            <h2>
                UNKNOWN FILE TYPE
            </h2>

            <p>
                ${escapeHtml(filePath)}
            </p>

        </div>

    `;

}


/* =========================================================
   DOCUMENT WINDOW
========================================================= */

function openDocumentWindow(
    titleText = "DOCUMENT"
) {

    const win =
        document.getElementById(
            "documentWindow"
        );


    if (!win) {

        console.warn(
            "[OMEGA] documentWindow NOT FOUND"
        );

        return;

    }


    const title =
        document.getElementById(
            "viewerTitle"
        );


    if (title) {

        title.textContent =
            titleText;

    }


    win.classList.remove(
        "hidden"
    );


    win.style.display =
        "flex";


    if (
        window.bringToFront
    ) {

        window.bringToFront(
            win
        );

    }

}


/* =========================================================
   VIDEO WINDOW
========================================================= */

function openVideoWindow(
    filePath
) {

    const win =
        document.getElementById(
            "videoWindow"
        );


    if (!win) {

        console.warn(
            "[OMEGA] videoWindow NOT FOUND"
        );

        return;

    }


    const video =
        document.getElementById(
            "omegaVideo"
        );


    if (video) {

        video.pause();

        video.src =
            filePath;

        video.load();

    }


    win.classList.remove(
        "hidden"
    );


    win.style.display =
        "flex";


    if (
        window.bringToFront
    ) {

        window.bringToFront(
            win
        );

    }

}


/* =========================================================
   BACK
========================================================= */

function goBack() {

    if (
        currentExplorerPath === "/files"
    ) {

        return;

    }


    const previousPath =
        currentExplorerPath;


    const parts =
        currentExplorerPath
            .split("/")
            .filter(Boolean);


    parts.pop();


    const newPath =
        "/" + parts.join("/");


    const finalPath =
        newPath === "/"
            ? "/files"
            : newPath;


    reportMrSmileAction({

        type:
            "folder_close",

        target:
            previousPath,

        action:
            "back",

        reason:
            "operator_navigated_back",

        metadata: {

            previousPath,

            newPath:
                finalPath,

            itemType:
                "directory"

        }

    });


    renderExplorer(
        finalPath
    );

}


/* =========================================================
   CURRENT PATH
========================================================= */

export function getCurrentExplorerPath() {

    return currentExplorerPath;

}


/* =========================================================
   PUBLIC OPEN
========================================================= */

export function openExplorerItemPublic(
    path
) {

    return openExplorerItem(
        path
    );

}


/* =========================================================
   OPEN EXPLORER
========================================================= */

export function openExplorer() {

    renderExplorer(
        "/files"
    );


    reportMrSmileAction({

        type:
            "navigation",

        target:
            "/files",

        action:
            "open",

        reason:
            "operator_opened_explorer",

        metadata: {

            path:
                "/files"

        }

    });

}


/* =========================================================
   EXTERNAL FILE CONTEXT TYPE
========================================================= */

function getExternalContextType(
    extension
) {

    switch (
        extension
    ) {

        case "pdf":
            return "file_open";

        case "txt":
            return "file_open";

        case "mp4":
        case "webm":
        case "ogg":
            return "file_open";

        case "png":
        case "jpg":
        case "jpeg":
        case "webp":
            return "file_open";

        default:
            return "file_open";

    }

}


/* =========================================================
   EXTENSION
========================================================= */

function getExtension(
    path
) {

    if (!path) {

        return "";

    }


    const cleanPath =
        String(path)
            .split("?")[0]
            .split("#")[0];


    const fileName =
        cleanPath
            .split("/")
            .pop();


    if (
        !fileName ||
        !fileName.includes(".")
    ) {

        return "";

    }


    return fileName
        .split(".")
        .pop()
        .toLowerCase();

}


/* =========================================================
   RESTRICTED PATH DETECTION
========================================================= */

function isRestrictedPath(
    path
) {

    if (!path) {

        return false;

    }


    const lower =
        String(path)
            .toLowerCase();


    /*
        This is intentionally conservative.

        Real permissions should eventually
        come from filesystem.js / roleManager.

        This function only helps Context
        understand what happened.
    */

    return (

        lower.includes("/restricted/") ||

        lower.includes("/secret/") ||

        lower.includes("/classified/") ||

        lower.includes("mirror-00") ||

        lower.includes("truth")

    );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.openExplorerItem =
    openExplorerItem;


window.goBack =
    goBack;


window.getCurrentExplorerPath =
    getCurrentExplorerPath;


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    text
) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    text
) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        );

}


/* =========================================================
   EXPORTS
========================================================= */
export {
    openExplorerItem,
    goBack
};
