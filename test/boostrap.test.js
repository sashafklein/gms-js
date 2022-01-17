import GMS from "../src/js/load";

describe("bootstrapping", () => {
  let root;
  let content;
  beforeEach(() => {
    document.outerHTML = `
      <html>
        <body>
        </body>
      </html>
    `;
    content = document.createElement("div");
    content.innerHTML = `
      <button class="gms-button gms-button--bolt">Bolt here</button>
      <button class="gms-button no-bolt">No bolt</button>
      <button class="nothing">No onlick added</button>
    `;
    root = document.createElement("div");
    root.id = "gms-root";
    document.body.append(content);
    document.body.prepend(root);
  });

  afterEach(() => {
    document.body.removeChild(root);
    document.body.removeChild(content);
  });

  describe("without a theme", () => {
    it("throws", () => {
      expect(GMS.bootstrap).toThrow();
    });
  });

  describe("without an invalid theme", () => {
    it("throws", () => {
      root.classList.add("gms-theme--made-up");
      expect(GMS.bootstrap).toThrow();
    });
  });

  describe("with a valid theme", () => {
    it("it adds dark theme class if theme is dark", () => {
      root.classList.add("gms-theme--dark-blue");
      GMS.bootstrap();
      expect(root.classList.contains("gms-theme--is-dark")).toEqual(true);
    });

    it("it adds light theme class if theme is light", () => {
      root.classList.add("gms-theme--white");
      GMS.bootstrap();
      expect(root.classList.contains("gms-theme--is-light")).toEqual(true);
    });

    it("it adds window, screen, and card", () => {
      root.classList.add("gms-theme--dark-blue");
      GMS.bootstrap();
      const win = root.children[0];
      const screen = win.children[0];
      const card = screen.children[0];
      expect(win.classList[0]).toEqual("gms-modal-window");
      expect(screen.classList[0]).toEqual("gms-modal-screen");
      expect(card.classList[0]).toEqual("gms-modal-card");
    });

    describe("button decoration", () => {
      let boltButton;
      let nonBoltButton;
      let nonGmsButton;

      beforeEach(() => {
        root.classList.add("gms-theme--dark-blue");
        GMS.setTriggers();
        boltButton = content.getElementsByClassName("gms-button--bolt")[0];
        nonBoltButton = content.getElementsByClassName("no-bolt")[0];
        nonGmsButton = content.getElementsByClassName("nothing")[0];
      });

      it("it adds bolt to bolt buttons", () => {
        const boltSvg = boltButton.getElementsByTagName("svg")[0];
        expect(boltSvg).toBeTruthy();
      });

      it("it does not add bolt to non-bolt buttons", () => {
        expect(nonBoltButton.getElementsByTagName("svg")[0]).not.toBeTruthy();
        expect(nonGmsButton.getElementsByTagName("svg")[0]).not.toBeTruthy();
      });

      it("it only adds onclick to gms buttons", () => {
        expect(boltButton.onclick).toBeTruthy();
        expect(nonBoltButton.onclick).toBeTruthy();
        expect(nonGmsButton.onclick).not.toBeTruthy();
      });

      it("is idempotent, and does not keep adding bolts on multiple calls", () => {
        const boltButtonHtml = boltButton.outerHTML;
        expect(boltButtonHtml.match("<svg").length).toEqual(1);
        GMS.setTriggers();
        expect(boltButton.outerHTML).toEqual(boltButtonHtml);
      });
    });
  });
});
