import GMS from "./gms";
import { parseSettings } from "./helpers/utils";

const bolt = (width = 12) => `
  <svg
    focusable="false"
    class="gms__icon"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 512"
    width="${width}"
  >
    <path fill="#fed954"
      d="M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"
    >
    </path>
  </svg>
`;

GMS.prepare = () => {
  const root = document.getElementById("gms-root");

  const globalSettings = parseSettings(root);

  if (!root) {
    throw new Error("GimmeSats -- No element found with ID 'gms-root'.");
  }

  const darkThemes = ["dark-blue"];
  const lightThemes = ["white"];
  const themes = [...darkThemes, ...lightThemes];
  const classes = [];

  if (root.classList.contains("gms-root--bootstrapped")) {
    window.gms = window.gms || GMS(root, globalSettings);
    return;
  }

  root.classList.forEach((klass) => {
    classes.push(klass);
  });

  const theme = classes.filter(
    (klass) =>
      klass.includes("gms-theme--") && themes.includes(klass.split("--")[1])
  )[0];

  if (!theme) {
    throw new Error("GimmeSats -- Root element requires a valid theme.");
  }

  root.classList.add(
    `gms-theme--is-${
      darkThemes.includes(theme.split("--")[1]) ? "dark" : "light"
    }`
  );

  if (root.children.length > 1) {
    throw new Error(
      "GimmeSats -- Root element cannot have more than one child."
    );
  }

  const container = document.createElement("div");
  container.classList.add("gms-modal-window");

  const screen = document.createElement("div");
  screen.classList.add("gms-modal-screen");

  const card = document.createElement("div");
  card.classList.add("gms-modal-card");

  screen.prepend(card);
  container.prepend(screen);
  root.prepend(container);

  window.gms = new GMS(root, globalSettings);
};

GMS.setTriggers = () => {
  const triggers = document.getElementsByClassName("gms-button");

  for (let i = 0; i < triggers.length; i++) {
    const trigger = triggers[i];

    trigger.onclick = () => {
      const settings = parseSettings(trigger);
      window.gms.trigger(settings);
    };

    const classes = trigger.classList;

    if (
      classes.contains("gms-button--bolt") &&
      !classes.contains("gms-button--bolt-added")
    ) {
      const text = trigger.innerHTML;

      if (text.length) {
        trigger.innerHTML = `${text}${bolt()}`;
      } else {
        trigger.innerHTML = bolt(14);
        classes.add("gms-button--no-text");
      }
      classes.add("gms-button--bolt-added");
    }
  }
};

GMS.bootstrap = () => {
  GMS.prepare();
  GMS.setTriggers();
};

export default GMS;
