
document.addEventListener("click", () => {

const bg = $("bgMusic");

if(bg){

bg.volume = 0.3;

bg.play().catch(()=>{});

}

},{once:true});
```
