import { playMusic } from "./audio.js";

let currentState = "login";

export function setSoundState(state) {
  if (state === currentState) return;

  currentState = state;

  switch (state) {

    case "login":
      playMusic("login.mp3", 0.5);
      break;

    case "desktop":
      playMusic("background.mp3", 0.3);
      break;

    case "console":
      playMusic("console.mp3", 0.4);
      break;

    case "camera":
      playMusic("camera.mp3", 0.35);
      break;

    default:
      playMusic("background.mp3", 0.3);
  }
}
