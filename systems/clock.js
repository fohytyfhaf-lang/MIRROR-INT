
function startClock(){

setInterval(() => {

$("clock").innerText =
new Date().toLocaleTimeString();

},1000);

}
```
