import { isDescendant, parseSettings } from "./helpers";

export default function (GMS) {
  const root = document.getElementById("gms-root");

  if (!root) {
    throw new Error("GimmeSats -- No element found with ID 'gms-root'.");
  }

  const globalSettings = parseSettings(root);

  const darkThemes = ["dark-blue"];
  const lightThemes = ["white"];
  const themes = [...darkThemes, ...lightThemes];
  const classes = [];

  root.classList.forEach((klass) => {
    classes.push(klass);
  });

  const theme = classes.filter(
    (klass) =>
      klass.includes("gms-theme--") && themes.includes(klass.split("--")[1])
  )[0];

  if (!theme) {
    throw new Error("GimmeSats -- Root element requires a theme.");
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

  window.gms = new GMS(root, card, globalSettings);

  // If the click was not within the card, close the modal.
  const closeModal = (event) => {
    if (!isDescendant(event.target, "gms-modal-card")) {
      gms.close();
    }
  };

  screen.onclick = closeModal;

  const triggers = document.getElementsByClassName("gms-button");

  for (let i = 0; i < triggers.length; i++) {
    const trigger = triggers[i];
    const settings = parseSettings(trigger);

    trigger.onclick = () => {
      window.gms.trigger(settings);
    };
  }
}
