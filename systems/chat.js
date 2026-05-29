
function sendStaffMessage(){

const input = $("staffInput");
const log = $("staffLog");

if(input.value.trim() === "") return;

log.innerText += "\nYOU: " + input.value;

setTimeout(() => {

const replies = [
"SYSTEM OK",
"REPORT RECEIVED",
"UNKNOWN SIGNAL",
"ENTITY DETECTED",
"ACCESS LOGGED"
];

const random =
replies[Math.floor(Math.random() * replies.length)];

log.innerText += "\nSYS: " + random;

log.scrollTop = log.scrollHeight;

}, 500);

input.value = "";

}
```
