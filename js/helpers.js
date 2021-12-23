export const defaults = {
  service: "STRIKE",
  amount: 0,
  note: "",
};

export const parseSettings = (element) => {
  const settingsString = element.getAttribute("data-settings") || "{}";

  let settings;
  try {
    settings = JSON.parse(settingsString);
  } catch (err) {
    throw new Error(
      `GimmeSats -- Failed to parse element settings. Make sure they are in JSON format.
          Element: ${element}
          Error: ${err}`
    );
  }

  return settings || {};
};

export const stages = ["AMOUNT_INPUT", "NOTE_INPUT", "INVOICE", "PAID"];

export const isDescendant = (child, parentClass) => {
  let node = child.parentNode;
  while (node != null) {
    if (node.classList && node.classList.contains(parentClass)) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};
