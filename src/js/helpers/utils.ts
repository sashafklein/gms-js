export const defaults = {
  service: "STRIKE",
  amount: 0,
  note: "",
  suggestTip: true,
};

export const parseData = (key: string, element: HTMLElement) => {
  const objectString = element.getAttribute(`data-${key}`) || "{}";

  let object;
  try {
    object = JSON.parse(objectString);
  } catch (err) {
    throw new Error(
      `GimmeSats -- Failed to parse element ${key}. Make sure they are in JSON format.
          Element: ${element}
          Error: ${err}`
    );
  }

  return object || {};
};

export const stages = ["AMOUNT_INPUT", "NOTE_INPUT", "INVOICE", "PAID"];

export const isDescendant = (child: Node, parentClass) => {
  let node = child.parentNode as HTMLElement;
  while (node != null) {
    if (node.classList && node.classList.contains(parentClass)) {
      return true;
    }
    node = node.parentNode as HTMLElement;
  }
  return false;
};
