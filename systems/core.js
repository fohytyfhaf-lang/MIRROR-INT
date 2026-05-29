function $(id){
  return document.getElementById(id);
}

function show(id){
  const el = $(id);
  if(el) el.classList.remove("hidden");
}

function hide(id){
  const el = $(id);
  if(el) el.classList.add("hidden");
}
