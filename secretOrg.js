const secretData = {
  accessLevel: 0,

  files: {
    "memo_01.txt": "The government is not in control.",
    "memo_02.txt": "OMEGA SYSTEM is watching.",
    "memo_03.txt": "Entity: MR.SMILE confirmed active."
  }
};

export function getSecretFile(name) {
  return secretData.files[name] || "ACCESS DENIED";
}

export function increaseAccess() {
  secretData.accessLevel++;
}
