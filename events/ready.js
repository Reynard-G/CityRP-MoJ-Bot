const { ActivityType } = require("discord.js");
const client = require("..");
const chalk = require("chalk");
const log = require("../logger");

client.on("ready", () => {
  const activities = [
    {
      name: "over inmates",
      type: ActivityType.Watching,
    },
    {
      name: "whistle blowers",
      type: ActivityType.Listening,
    },
    {
      name: "Protecting",
      state: "Protecting the people",
      type: ActivityType.Custom,
    },
    { name: "Cop", state: "👮‍♂️", type: ActivityType.Custom },
  ];
  const status = ["dnd"];
  let i = 0;
  setInterval(() => {
    if (i >= activities.length) i = 0;
    client.user.setActivity(activities[i]);
    i++;
  }, 5000);

  let s = 0;
  setInterval(() => {
    if (s >= activities.length) s = 0;
    client.user.setStatus(status[s]);
    s++;
  }, 30000);

  log.success(
    `Logged in as ${chalk.cyan(client.user.tag)}. [${chalk.cyan(
      client.user.id
    )}]`
  );
});
