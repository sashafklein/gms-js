const element = (klass, innerHTML = "", type = "div") => {
  const el = document.createElement(type);
  el.classList.add(klass);
  el.innerHTML = innerHTML;
  return el;
};

export default element;
