const fs = require("fs");
const log = require("../logger");

module.exports = (client) => {
  fs.readdirSync("./events/")
    .filter((file) => file.endsWith(".js"))
    .forEach((event) => {
      require(`../events/${event}`);
    });
  log.success(`Events • Loaded`);
};
