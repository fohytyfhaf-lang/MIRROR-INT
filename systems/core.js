
const $ = (id) => document.getElementById(id);

function show(id){
const el = $(id);
if(el) el.style.display = "block";
}

function hide(id){
const el = $(id);
if(el) el.style.display = "none";
}


