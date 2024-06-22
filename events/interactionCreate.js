const { EmbedBuilder, Collection, PermissionsBitField } = require("discord.js");
const ms = require("ms");
const client = require("..");
const log = require("../logger");
const chalk = require("chalk");

const cooldown = new Collection();

client.on("interactionCreate", async (interaction) => {
  const slashCommand = client.slashCommands.get(interaction.commandName);

  if (interaction.type == 4) {
    if (slashCommand.autocomplete) {
      const choices = [];
      return await slashCommand.autocomplete(interaction, choices);
    }
  }

  if (!interaction.type == 2) return;

  if (!slashCommand)
    return client.slashCommands.delete(interaction.commandName);
  try {
    if (slashCommand.cooldown) {
      if (cooldown.has(`slash-${slashCommand.name}${interaction.user.id}`)) {
        const cooldownEmbed = new EmbedBuilder()
          .setDescription(
            `🕒 ${interaction.user}, Please wait for \`${ms(
              cooldown.get(`slash-${slashCommand.name}${interaction.user.id}`) -
                Date.now(),
              { long: true }
            )}\` before using this command again!`
          )
          .setColor("Red");
        return interaction.reply({ embeds: [cooldownEmbed] });
      }

      if (slashCommand.userPerms || slashCommand.botPerms) {
        if (
          !interaction.memberPermissions.has(
            PermissionsBitField.resolve(slashCommand.userPerms || [])
          )
        ) {
          const userPerms = new EmbedBuilder()
            .setDescription(
              `🚫 ${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({ embeds: [userPerms] });
        }

        if (
          !interaction.guild.members.cache
            .get(client.user.id)
            .permissions.has(
              PermissionsBitField.resolve(slashCommand.botPerms || [])
            )
        ) {
          const botPerms = new EmbedBuilder()
            .setDescription(
              `🚫 ${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({ embeds: [botPerms] });
        }
      }

      log.info(
        `${chalk.cyan(interaction.user.tag)} used ${chalk.cyan(
          "/" + slashCommand.name
        )} | g: ${chalk.cyan(interaction.guild.name)} [${chalk.cyan(
          interaction.guild.id
        )}] | c: ${chalk.cyan(interaction.channel.name)} [${chalk.cyan(
          interaction.channel.id
        )}]`
      );

      await slashCommand.run(client, interaction);
      cooldown.set(
        `slash-${slashCommand.name}${interaction.user.id}`,
        Date.now() + slashCommand.cooldown
      );
      setTimeout(() => {
        cooldown.delete(`slash-${slashCommand.name}${interaction.user.id}`);
      }, slashCommand.cooldown);
    } else {
      if (slashCommand.userPerms || slashCommand.botPerms) {
        if (
          !interaction.memberPermissions.has(
            PermissionsBitField.resolve(slashCommand.userPerms || [])
          )
        ) {
          const userPerms = new EmbedBuilder()
            .setDescription(
              `🚫 ${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({ embeds: [userPerms] });
        }

        if (
          !interaction.guild.members.cache
            .get(client.user.id)
            .permissions.has(
              PermissionsBitField.resolve(slashCommand.botPerms || [])
            )
        ) {
          const botPerms = new EmbedBuilder()
            .setDescription(
              `🚫 ${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({ embeds: [botPerms] });
        }
      }

      log.info(
        `${chalk.cyan(interaction.user.tag)} used ${chalk.cyan(
          "/" + slashCommand.name
        )} | g: ${chalk.cyan(interaction.guild.name)} [${chalk.cyan(
          interaction.guild.id
        )}] | c: ${chalk.cyan(interaction.channel.name)} [${chalk.cyan(
          interaction.channel.id
        )}]`
      );

      await slashCommand.run(client, interaction);
    }
  } catch (error) {
    log.error(
      `Error while executing slash command "${slashCommand.name}" | ${error}`,
      "events/interactionCreate.js"
    );
  }
});
