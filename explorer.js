import { listFiles, readFile } from "./filesystem.js";

let currentExplorerPath = "/files";

/* ===== INTERNAL RENDER ===== */
function renderExplorer(path) {
  const view = document.getElementById("filesList");
  const pathBar = document.getElementById("pathBar");

  if (!view) return;

  currentExplorerPath = path;

  if (pathBar) pathBar.textContent = path;

  const items = listFiles(path);

  view.innerHTML = items.length
    ? items.map(item => {
        const fullPath = path + "/" + item;

        return `<div onclick="openExplorerItem('${fullPath}')">
                  📄 ${item}
                </div>`;
      }).join("")
    : "EMPTY FOLDER";
}

/* ===== GLOBAL UI ===== */
window.openExplorerItem = function(path) {
  const content = readFile(path);

  if (content !== null) {
    document.getElementById("filesList").innerText = content;
  } else {
    renderExplorer(path);
  }
};

window.goBack = function() {
  if (currentExplorerPath === "/files") return;

  const parts = currentExplorerPath.split("/");
  parts.pop();

  const newPath = parts.join("/") || "/files";

  renderExplorer(newPath);
};

/* ===== ENTRY POINT ===== */
export function openExplorer() {
  renderExplorer("/files");
}
