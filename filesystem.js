const filesystem = {
  "/": {
    type: "dir",
    content: {
      files: {
        type: "dir",
        content: {
          "readme.txt": { type: "file", data: "PUBLIC INFO", level: 0 },

          "memo.txt": { 
            type: "file", 
            data: "Operator notes: system unstable", 
            level: 1 
          },

          "entity_mrsmile.txt": { 
            type: "file", 
            data: "DO NOT ENGAGE", 
            level: 2 
          }
        }
      }
    }
  }
};

let currentPath = "/";

export function listFiles(path = "/") {
  const node = getNode(path);
  if (!node || node.type !== "dir") return [];

  return Object.keys(node.content);
}
import { canAccess } from "./security.js";


export function readFile(path) {
  const node = getNode(path);

  if (!node || node.type !== "file") return null;

  if (!canAccess(node.level || 0)) {
    return "ACCESS DENIED";
  }

  return node.data;
}

function getNode(path) {
  const parts = path.split("/").filter(Boolean);
  let current = filesystem["/"];

  for (const p of parts) {
    if (!current.content[p]) return null;
    current = current.content[p];
  }

  return current;
}
