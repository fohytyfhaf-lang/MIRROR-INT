
let progress = 0;

window.addEventListener("DOMContentLoaded", () => {

setTimeout(() => {

hide("biosScreen");

startBoot();

}, 1500);

});

function startBoot(){

const bar = $("bootProgress");
const text = $("loadText");

const boot = setInterval(() => {

progress += 4;

bar.style.width = progress + "%";
text.innerText = progress + "%";

if(progress >= 100){

clearInterval(boot);

hide("loading");

document.getElementById("login").classList.add("active");

}

}, 100);

}

