const {
  Client,
  ButtonInteraction,
  EmbedBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  id: "fileCriminalRecordButton",
  permissions: [],
  userRoles: [process.env.POLICE_ROLE_ID],
  /**
   * @param {Client} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const forumChannel = interaction.guild.channels.cache.get(
      process.env.RECORDS_AUDIT_CHANNEL_ID
    );
    if (!forumChannel) {
      const forumChannelNotFoundEmbed = new EmbedBuilder()
        .setTitle("Criminal Records Channel Not Found")
        .setDescription(
          "The criminal records channel was not found. Please contact an administrator to set it up."
        )
        .setColor("Red")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });

      return interaction.reply({
        embeds: [forumChannelNotFoundEmbed],
        ephemeral: true,
      });
    }

    // Create a modal for the user to fill out the form
    const modal = new ModalBuilder()
      .setCustomId("criminalRecordModal")
      .setTitle("File a Criminal Record");

    const nameInput = new TextInputBuilder()
      .setCustomId("criminalRecordModal-nameInput")
      .setLabel("Offender's Name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex: MilkLegend")
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(16);

    modal.addComponents(new ActionRowBuilder().addComponents(nameInput));

    return await interaction.showModal(modal);
  },
};
