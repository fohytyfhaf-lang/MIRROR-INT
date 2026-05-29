```js
function loginSystem() {

  const user =
    document.getElementById("user")?.value;

  const pass =
    document.getElementById("pass")?.value;

  const status =
    document.getElementById("loginStatus");

  let ok = false;

  if (user === "operator" && pass === "0404")
    ok = true;

  if (user === "research" && pass === "void")
    ok = true;

  if (user === "omega" && pass === "mirror")
    ok = true;

  if (!ok) {

    if (status)
      status.innerText = "ACCESS DENIED";

    return;
  }

  if (status)
    status.innerText = "ACCESS GRANTED";

  setTimeout(() => {

    document
      .getElementById("login")
      ?.classList.remove("active");

    document
      .getElementById("screen")
      .style.display = "block";

    startClock();

  }, 600);
}
```

