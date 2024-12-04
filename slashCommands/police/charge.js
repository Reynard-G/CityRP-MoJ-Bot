const {
  Client,
  CommandInteraction,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const db = require("../../lib/db");
const { criminals } = require("../../drizzle/schema");
const log = require("../../logger");
const { like } = require("drizzle-orm");

module.exports = {
  name: "charge",
  description: "Charge a criminal.",
  type: ApplicationCommandType.ChatInput,
  userRoles: [process.env.POLICE_ROLE_ID],
  options: [
    {
      name: "offender",
      description: "The offender's name.",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ],
  /**
   * @param {CommandInteraction} interaction
   * @param {[]} choices
   */
  autocomplete: async (interaction, choices) => {
    const focusedValue = interaction.options.getFocused();

    const data = focusedValue
      ? await db
          .select({
            username: criminals.username,
          })
          .from(criminals)
          .where(like(criminals.username, `%${focusedValue}%`))
          .limit(25)
      : await db
          .select({
            username: criminals.username,
          })
          .from(criminals)
          .limit(25);

    data.forEach((criminal) => {
      choices.push({
        name: `${criminal.username}`,
        value: `${criminal.username}`,
      });
    });

    interaction.respond(choices).catch(log.error);
  },
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const offender = interaction.options.get("offender").value;

    // Check if offender's record exists in the database
    const criminalRecord = await db
      .select()
      .from(criminals)
      .where({ username: offender });
    if (criminalRecord.length === 0) {
      const recordNotFoundEmbed = new EmbedBuilder()
        .setTitle("Criminal Record Not Found")
        .setDescription(`A criminal record does not exist for **${offender}**.`)
        .setColor("Red")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });

      return interaction.reply({
        embeds: [recordNotFoundEmbed],
        ephemeral: true,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId("criminalChargeModal")
      .setTitle(`Criminal Charge for ${offender}`);

    const nameInput = new TextInputBuilder()
      .setCustomId("criminalChargeModal-nameInput")
      .setLabel("Offender's Name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex: MilkLegend")
      .setValue(offender)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(16);

    const chargesInput = new TextInputBuilder()
      .setCustomId("criminalChargeModal-chargesInput")
      .setLabel("Charges")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Ex: Robbery (1x), Murder (2x), etc")
      .setRequired(true)
      .setMaxLength(256);

    const jailTimeInput = new TextInputBuilder()
      .setCustomId("criminalChargeModal-jailTimeInput")
      .setLabel("Jail Time")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex: 10m")
      .setRequired(true)
      .setMaxLength(64);

    const fineInput = new TextInputBuilder()
      .setCustomId("criminalChargeModal-fineInput")
      .setLabel("Fine")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex: $1000")
      .setRequired(true)
      .setMaxLength(64);

    const summaryInput = new TextInputBuilder()
      .setCustomId("criminalChargeModal-summaryInput")
      .setLabel("Summary")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(1024);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(chargesInput),
      new ActionRowBuilder().addComponents(jailTimeInput),
      new ActionRowBuilder().addComponents(fineInput),
      new ActionRowBuilder().addComponents(summaryInput)
    );

    return await interaction.showModal(modal);
  },
};
