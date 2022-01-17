import el from "../pieces/element";

const Loader = () => {
  return el(
    "gms-modal-content",
    `<div class="gms-modal__spinner-container">
      <div class="gms-modal__spinner"></div>
     </div>`
  );
};

export default Loader;
