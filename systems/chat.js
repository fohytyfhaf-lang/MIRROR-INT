let chat = [];

function sendMsg(){
  const inp = $("chatInput");
  const box = $("chatBox");

  chat.push("YOU: " + inp.value);
  chat.push("SYS: message received");

  box.innerText = chat.join("\n");

  inp.value = "";
}
