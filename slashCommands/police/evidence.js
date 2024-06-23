const {
  Client,
  CommandInteraction,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { eq, desc } = require("drizzle-orm");
const db = require("../../lib/db");
const {
  criminals,
  criminalIndictments,
  criminalEvidence,
} = require("../../drizzle/schema");
const log = require("../../logger");

module.exports = {
  name: "evidence",
  description: "Submit evidence against a criminal.",
  type: ApplicationCommandType.ChatInput,
  userRoles: [process.env.POLICE_ROLE_ID],
  options: [
    {
      name: "indictment",
      description: "The indictment number of the charge(s).",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
    {
      name: "evidence_1",
      description: "The evidence against the criminal.",
      type: ApplicationCommandOptionType.Attachment,
      required: true,
    },
    {
      name: "evidence_2",
      description: "The evidence against the criminal.",
      type: ApplicationCommandOptionType.Attachment,
    },
    {
      name: "evidence_3",
      description: "The evidence against the criminal.",
      type: ApplicationCommandOptionType.Attachment,
    },
    {
      name: "evidence_4",
      description: "The evidence against the criminal.",
      type: ApplicationCommandOptionType.Attachment,
    },
    {
      name: "evidence_5",
      description: "The evidence against the criminal.",
      type: ApplicationCommandOptionType.Attachment,
    },
    {
      name: "evidence_6",
      description: "The evidence against the criminal.",
      type: ApplicationCommandOptionType.Attachment,
    },
    {
      name: "evidence_7",
      description: "The evidence against the criminal.",
      type: ApplicationCommandOptionType.Attachment,
    },
    {
      name: "evidence_8",
      description: "The evidence against the criminal.",
      type: ApplicationCommandOptionType.Attachment,
    },
  ],
  /**
   * @param {CommandInteraction} interaction
   * @param {[]} choices
   */
  autocomplete: async (interaction, choices) => {
    const focusedValue = interaction.options.getFocused();

    const data = await db
      .select({
        id: criminalIndictments.id,
        username: criminals.username,
        charges: criminalIndictments.charges,
      })
      .from(criminalIndictments)
      .innerJoin(criminals, eq(criminals.id, criminalIndictments.criminal_id))
      .orderBy(desc(criminalIndictments.id));

    const filteredData = data.filter((indictment) => {
      const name = `#${indictment.id} • ${indictment.username} • ${indictment.charges}`;
      return name.includes(focusedValue);
    });

    choices = filteredData.map((indictment) => ({
      name: `#${indictment.id} • ${indictment.username} • ${indictment.charges}`,
      value: `${indictment.id}`,
    }));

    interaction.respond(choices).catch(log.error);
  },
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    try {
      const indictmentId = interaction.options.get("indictment").value;
      const evidence1 = interaction.options.get("evidence_1").attachment;
      const evidence2 = interaction.options.get("evidence_2")?.attachment;
      const evidence3 = interaction.options.get("evidence_3")?.attachment;
      const evidence4 = interaction.options.get("evidence_4")?.attachment;
      const evidence5 = interaction.options.get("evidence_5")?.attachment;
      const evidence6 = interaction.options.get("evidence_6")?.attachment;
      const evidence7 = interaction.options.get("evidence_7")?.attachment;
      const evidence8 = interaction.options.get("evidence_8")?.attachment;

      // Check if the indictment exists in the database
      const indictment = (
        await db.select().from(criminalIndictments).where({ id: indictmentId })
      )[0];
      if (!indictment) {
        const indictmentNotFoundEmbed = new EmbedBuilder()
          .setTitle("Indictment Not Found")
          .setDescription(
            `The indictment ID, **${indictmentId}**, does not exist.`
          )
          .setColor("Red")
          .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL(),
          });

        return interaction.editReply({
          embeds: [indictmentNotFoundEmbed],
          ephemeral: true,
        });
      }

      const evidenceRecords = [
        evidence1,
        evidence2,
        evidence3,
        evidence4,
        evidence5,
        evidence6,
        evidence7,
        evidence8,
      ].filter(Boolean);

      // Check if all attachments are images
      if (
        evidenceRecords.some(
          (evidence) => !evidence.contentType.startsWith("image/")
        )
      ) {
        const invalidAttachmentEmbed = new EmbedBuilder()
          .setTitle("Invalid Attachment Type(s)")
          .setDescription("All attachments must be images.")
          .setColor("Red")
          .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL(),
          });

        return interaction.editReply({
          embeds: [invalidAttachmentEmbed],
          ephemeral: true,
        });
      }

      // Check if all attachments are less than mediumblob size
      if (evidenceRecords.some((evidence) => evidence.size > 16777215)) {
        const attachmentTooLargeEmbed = new EmbedBuilder()
          .setTitle("Attachment(s) Too Large")
          .setDescription("All attachments must be less than 16MB.")
          .setColor("Red")
          .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL(),
          });

        return interaction.editReply({
          embeds: [attachmentTooLargeEmbed],
          ephemeral: true,
        });
      }

      // Insert the evidence into the database
      const evidencePromises = evidenceRecords.map(async (attachment) => {
        const res = await fetch(attachment.url);
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer);

        return db.insert(criminalEvidence).values({
          indictment_id: indictmentId,
          attachment: base64,
        });
      });

      await Promise.all(evidencePromises);

      const indictmentDiscordDetails = (
        await db
          .select({
            message_id: criminalIndictments.message_id,
            thread_id: criminals.thread_id,
          })
          .from(criminalIndictments)
          .innerJoin(
            criminals,
            eq(criminals.id, criminalIndictments.criminal_id)
          )
          .where(eq(criminalIndictments.id, indictmentId))
      )[0];

      const indictmentMessage = await interaction.guild.channels.cache
        .get(indictmentDiscordDetails.thread_id)
        .messages.fetch(indictmentDiscordDetails.message_id);

      const evidenceSubmittedEmbed = new EmbedBuilder()
        .setTitle("Evidence Submitted")
        .setDescription(
          `
          Evidence has been submitted for indictment **#${indictmentId}**.
          Please manually post the evidence replying to the following message: ${indictmentMessage.url}
          `
        )
        .setColor("Green")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
      return interaction.editReply({ embeds: [evidenceSubmittedEmbed] });
    } catch (error) {
      log.error("An error occurred while submitting evidence.", error);

      const errorEmbed = new EmbedBuilder()
        .setTitle("An Error Occurred")
        .setDescription("An error occurred while submitting evidence.")
        .setColor("Red")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
      return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
