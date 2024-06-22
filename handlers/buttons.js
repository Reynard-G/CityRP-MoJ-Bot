const fs = require("fs");
const log = require("../logger");

module.exports = (client) => {
  fs.readdirSync("./buttons/")
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      const button = require(`../buttons/${file}`);
      client.buttons.set(button.id, button);
    });
  log.success("Buttons • Loaded");
};
