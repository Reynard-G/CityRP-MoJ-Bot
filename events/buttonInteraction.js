const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const client = require("..");
const log = require("../logger");
const chalk = require("chalk");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const button = client.buttons.get(interaction.customId);
  if (!button) return;

  try {
    if (button.permissions) {
      if (
        !interaction.memberPermissions.has(
          PermissionsBitField.resolve(button.permissions || [])
        )
      ) {
        const perms = new EmbedBuilder()
          .setDescription(
            `🚫 ${interaction.user}, You don't have \`${button.permissions}\` permissions to interact this button!`
          )
          .setColor("Red");
        return interaction.reply({ embeds: [perms], ephemeral: true });
      }
    }

    log.info(
      `${chalk.cyan(interaction.user.tag)} clicked ${chalk.cyan(
        button.id
      )} | g: ${chalk.cyan(interaction.guild.name)} [${chalk.cyan(
        interaction.guild.id
      )}] | c: ${chalk.cyan(interaction.channel.name)} [${chalk.cyan(
        interaction.channel.id
      )}]`
    );

    await button.run(client, interaction);
  } catch (error) {
    log.error(
      `Error while executing button "${button.id}" | ${error}`,
      "events/buttonInteraction.js"
    );
  }
});
