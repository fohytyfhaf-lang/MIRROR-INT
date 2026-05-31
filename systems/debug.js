export function enableDebugMode() {

  console.log("🧠 DEBUG MODE ACTIVE");

  document.addEventListener("click", (e) => {

    const el = e.target;

    console.log("CLICK:", el);

    const style = window.getComputedStyle(el);

    console.log({
      id: el.id,
      class: el.className,
      display: style.display,
      zIndex: style.zIndex,
      position: style.position
    });

  });

  checkOverlays();
}
