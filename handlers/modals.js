const fs = require("fs");
const log = require("../logger");

module.exports = (client) => {
  fs.readdirSync("./modals/")
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      const modal = require(`../modals/${file}`);
      client.modals.set(modal.id, modal);
    });
  log.success("Modals • Loaded");
};
