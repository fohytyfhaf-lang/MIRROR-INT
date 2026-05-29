let chat = [];

function sendMsg(){
  const inp = $("chatInput");

  chat.push("YOU: " + inp.value);
  chat.push("SYS: worker response active");

  $("chatBox").innerText = chat.join("\n");

  inp.value = "";
}
