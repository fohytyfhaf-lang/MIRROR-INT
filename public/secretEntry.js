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

function enterOmega(){

    const publicSite =
    document.getElementById("publicSite");

    const login =
    document.getElementById("loginScreen");

    publicSite.classList.add("hidden");

    login.classList.remove("hidden");

}
