export const prepDocument = () => {
  document.outerHTML = `
      <html>
        <body>
        </body>
      </html>
    `;

  const content = document.createElement("div");
  content.innerHTML = `
      <button class="gms-button gms-button--bolt">Bolt here</button>
      <button class="gms-button no-bolt">No bolt</button>
      <button class="nothing">No onlick added</button>
    `;
  const root = document.createElement("div");
  root.id = "gms-root";
  root.classList.add("gms-theme--dark-blue");
  document.body.append(content);
  document.body.prepend(root);

  return { root, content };
};
