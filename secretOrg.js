let clearance = 0;

const files = {
  level0: {
    "welcome.txt": "SYSTEM ACTIVE",
  },

  level1: {
    "memo_01.txt": "They are watching the system.",
    "memo_02.txt": "Government denies anomaly reports.",
  },

  level2: {
    "ENTITY_MRSMILE.txt": "DO NOT ENGAGE",
    "log_corruption.txt": "Reality instability detected."
  }
};

export function getFile(level, name) {
  return files[level]?.[name] || "ACCESS DENIED";
}

export function setClearance(level) {
  clearance = level;
}

export function getClearance() {
  return clearance;
}
