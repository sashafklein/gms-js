import button from "./button";

const actionGroup = (primary, secondary) => {
  const group = document.createElement("div");
  group.classList.add("gms-modal-actions");

  if (primary) {
    group.append(button(primary, "med"));
  }

  if (secondary) {
    group.append(button(secondary, "light"));
  }

  return group;
};

export default actionGroup;
