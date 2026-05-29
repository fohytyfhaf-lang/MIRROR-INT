window.onload = () => {
  let p = 0;
  const boot = $("boot");

  const i = setInterval(()=>{
    p += 10;
    boot.innerText = "BOOT " + p + "%";

    if(p >= 100){
      clearInterval(i);
      hide("boot");
      show("login");
    }
  },200);
};
