const actionGroup = (primary, secondary) => {
  let pri;
  let sec;

  const group = document.createElement("div");
  group.classList.add("gms-modal-actions");

  if (primary) {
    pri = document.createElement("button");
    pri.classList.add("gms-button");
    pri.classList.add("gms-button--med");
    pri.disabled = primary.disabled;
    pri.innerHTML = primary.text;
    pri.onclick = primary.onClick;
    group.append(pri);
  }

  if (secondary) {
    sec = document.createElement("button");
    sec.classList.add("gms-button");
    sec.classList.add("gms-button--light");
    sec.disabled = secondary.disabled;
    sec.innerHTML = secondary.text;
    sec.onclick = secondary.onClick;
    group.append(sec);
  }

  return group;
};

export default actionGroup;
