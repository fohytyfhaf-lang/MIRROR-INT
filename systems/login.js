
function loginSystem(){

const user = $("user").value;
const pass = $("pass").value;

const status = $("loginStatus");

if(user === "omega" && pass === "mirror"){

status.innerText = "ACCESS GRANTED";

setTimeout(() => {

document.getElementById("login").classList.remove("active");

show("screen");

startClock();

}, 500);

}else{

status.innerText = "ACCESS DENIED";

}

}

