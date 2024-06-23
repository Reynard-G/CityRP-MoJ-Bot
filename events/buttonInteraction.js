const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const client = require("..");
const log = require("../logger");
const chalk = require("chalk");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const button = client.buttons.get(interaction.customId);
  if (!button) return;

  try {
    // Check if user has the required permissions to interact with the button
    if (button.permissions) {
      if (
        !interaction.memberPermissions.has(
          PermissionsBitField.resolve(button.permissions || [])
        )
      ) {
        const perms = new EmbedBuilder()
          .setDescription(
            `🚫 ${interaction.user}, you don't have \`${button.permissions}\` permissions to interact this button!`
          )
          .setColor("Red");
        return interaction.reply({ embeds: [perms], ephemeral: true });
      }
    }

    // Check if the user has the required roles to interact with the button
    if (button.userRoles) {
      const memberRoles = interaction.member.roles.cache.map((r) => r.id);

      if (!memberRoles.some((r) => button.userRoles.includes(r))) {
        const rolesEmbed = new EmbedBuilder()
          .setDescription(
            `🚫 ${interaction.user}, you don't have the required roles to interact with this button!`
          )
          .setColor("Red");
        return interaction.reply({ embeds: [rolesEmbed], ephemeral: true });
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
