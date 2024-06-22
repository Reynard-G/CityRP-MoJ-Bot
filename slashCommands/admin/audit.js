const {
  Client,
  CommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const log = require("../../logger");

module.exports = {
  name: "audit",
  description: "Set up audit logs for criminal records.",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "set",
      description: "Set up the message for criminal records.",
      type: 1,
      options: [
        {
          name: "channel",
          description: "The channel for users to create criminal records.",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const channel = interaction.options.get("channel").channel;

      // Check if the channel is a Forum Channel
      const invalidChannelTypeEmbed = new EmbedBuilder()
        .setTitle("Invalid Channel Type")
        .setDescription("The channel must be a Forum Channel.")
        .setColor("Red")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
      if (channel.isThreadOnly())
        return interaction.reply({
          embeds: [invalidChannelTypeEmbed],
          ephemeral: true,
        });

      const embed = new EmbedBuilder()
        .setTitle("File a Criminal Record")
        .setDescription(
          "To file a criminal record, click the button below and fill out the form with information pertaining to the offender."
        )
        .setColor(0x135dd8)
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("File a Criminal Record")
          .setEmoji("📁")
          .setStyle("Success")
          .setCustomId("fileCriminalRecordButton")
      );

      await channel.send({ embeds: [embed], components: [buttons] });
      return interaction.reply({
        content: `Successfully set up the ability to file criminal records in ${channel}.`,
        ephemeral: true,
      });
    } catch (error) {
      log.error(
        "An error occurred while setting up the ability to file criminal records.",
        error
      );

      const errorEmbed = new EmbedBuilder()
        .setTitle("An Error Occurred")
        .setDescription(
          "An error occurred while setting up the ability to file criminal records."
        )
        .setColor("Red")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
      return interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
  },
};
