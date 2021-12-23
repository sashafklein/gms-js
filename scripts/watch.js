const fs = require("fs");
const rollup = require("rollup");
const server = require("http-server");

const config = require("./rollup-config");

const buildCss = require("./css");

const watch = async () => {
  await buildCss();

  console.log("CSS/JS built. Watching for changes...\n");

  const watcher = rollup.watch(config);
  fs.watch("./scss", () => {
    console.log("Rebuilding SCSS.");
    buildCss();
  });

  watcher.on("event", (event) => {
    const { result, code } = event;
    console.log("Rebuilding JS.");

    if (code === "ERROR") {
      console.log("Error rebuilding bundle", event);
    }

    if (result) {
      result.close();
    }
  });
};

watch();
