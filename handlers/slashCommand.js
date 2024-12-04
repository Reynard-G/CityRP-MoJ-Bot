const fs = require("fs");
const log = require("../logger");

const { PermissionsBitField } = require("discord.js");
const { Routes } = require("discord-api-types/v10");
const { REST } = require("@discordjs/rest");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const rest = new REST({ version: "10" }).setToken(TOKEN);

module.exports = (client) => {
  const slashCommands = [];

  fs.readdirSync("./slashCommands/").forEach(async (dir) => {
    const files = fs
      .readdirSync(`./slashCommands/${dir}/`)
      .filter((file) => file.endsWith(".js"));

    for (const file of files) {
      const slashCommand = require(`../slashCommands/${dir}/${file}`);
      slashCommands.push({
        name: slashCommand.name,
        description: slashCommand.description,
        type: slashCommand.type,
        options: slashCommand.options ? slashCommand.options : null,
        default_permission: slashCommand.default_permission
          ? slashCommand.default_permission
          : null,
        default_member_permissions: slashCommand.default_member_permissions
          ? PermissionsBitField.resolve(
              slashCommand.default_member_permissions
            ).toString()
          : null,
      });

      if (slashCommand.name) {
        client.slashCommands.set(slashCommand.name, slashCommand);
      } else {
        log.warn(`Failed to load slash command "${file}"`);
      }
    }
  });
  log.success(`Slash Commands • Loaded`);

  (async () => {
    try {
      await rest.put(
        process.env.GUILD_ID
          ? Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID)
          : Routes.applicationCommands(CLIENT_ID),
        { body: slashCommands }
      );
      log.success("Slash Commands • Registered");
    } catch (error) {
      log.error(
        `Error while registering slash commands | ${error}`,
        "handlers/slashCommand.js"
      );
    }
  })();
};
