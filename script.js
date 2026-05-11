function openFile() {
  const files = [
    "SUBJECT: UNKNOWN ENTITY DETECTED",
    "LOG: EXPERIMENT FAILED",
    "WARNING: MEMORY CORRUPTION",
    "FILE CLASSIFIED - ACCESS DENIED"
  ];

  let pick = files[Math.floor(Math.random() * files.length)];
  alert(pick);
}
