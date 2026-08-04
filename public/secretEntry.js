let holdTimer = null;

export function initSecretEntry(){

    const logo = document.getElementById("headerLogo");

    if(!logo) return;

    logo.addEventListener("mouseenter", ()=>{

        holdTimer = setTimeout(()=>{

            enterOmega();

        },3000);

    });

    logo.addEventListener("mouseleave", ()=>{

        clearTimeout(holdTimer);

    });

}
