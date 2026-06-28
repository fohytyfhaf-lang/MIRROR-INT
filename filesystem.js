const filesystem = {
  "/": {
    type: "dir",
    content: {
      logs: {
        type: "dir",
        content: {
          "log1.txt": { type: "file", data: "System boot OK" },
          "log2.txt": { type: "file", data: "User login detected" }
        }
      },
      
      files: {
        type: "dir",
        content: {
          "readme.txt": { type: "file", data: "OMEGA SYSTEM ACTIVE" }
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

export function readFile(path) {
  const node = getNode(path);
  if (!node || node.type !== "file") return null;

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
