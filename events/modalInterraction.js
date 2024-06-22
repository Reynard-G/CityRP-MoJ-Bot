const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const client = require("..");
const log = require("../logger");
const chalk = require("chalk");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  const modal = client.modals.get(interaction.customId);
  if (!modal) return;

  try {
    if (modal.permissions) {
      if (
        !interaction.memberPermissions.has(
          PermissionsBitField.resolve(modal.permissions || [])
        )
      ) {
        const perms = new EmbedBuilder()
          .setDescription(
            `🚫 ${interaction.user}, You don't have \`${modal.permissions}\` permissions to interact this modal!`
          )
          .setColor("Red");
        return interaction.reply({ embeds: [perms], ephemeral: true });
      }
    }

    log.info(
      `${chalk.cyan(interaction.user.tag)} submitted ${chalk.cyan(
        modal.id
      )} | g: ${chalk.cyan(interaction.guild.name)} [${chalk.cyan(
        interaction.guild.id
      )}] | c: ${chalk.cyan(interaction.channel.name)} [${chalk.cyan(
        interaction.channel.id
      )}]`
    );

    await modal.run(client, interaction);
  } catch (error) {
    console.log(error);
    log.error(
      `Error while executing modal "${modal.id}" | ${error}`,
      "events/modalInteraction.js"
    );
  }
});
