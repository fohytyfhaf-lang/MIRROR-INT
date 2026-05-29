function login(){
  const u = $("user").value;
  const p = $("pass").value;

  const st = $("loginStatus");

  if((u==="admin" && p==="1234") || (u==="op" && p==="0404")){
    st.innerText = "ACCESS GRANTED";

    setTimeout(()=>{
      hide("login");
      show("desktop");
    },500);

  } else {
    st.innerText = "DENIED";
  }
}
