const button = (obj, tone) => {
  const b = document.createElement("button");
  b.classList.add("gms-button");
  b.classList.add(`gms-button--${tone || obj.tone}`);
  b.disabled = obj.disabled;
  b.innerHTML = obj.text;
  b.onclick = obj.onClick;
  return b;
};

export default button;
