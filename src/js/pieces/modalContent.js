import el from "./element";
import actionGroup from "./actionGroup";

const modalContent = (headerContent, bodyContent, makeActionObjects) => {
  const content = el("gms-modal-content");
  const header = el("gms-modal-header", headerContent);
  const body = el("gms-modal-body", bodyContent);
  const actions = actionGroup(...makeActionObjects({ header, body }));

  content.appendChild(header);
  content.appendChild(body);
  content.appendChild(actions);

  return { content, header, body, actions };
};

export default modalContent;
