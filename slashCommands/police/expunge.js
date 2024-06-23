const {
  Client,
  CommandInteraction,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { eq, desc } = require("drizzle-orm");
const db = require("../../lib/db");
const { criminals, criminalIndictments } = require("../../drizzle/schema");
const log = require("../../logger");

module.exports = {
  name: "expunge",
  description: "Expunge a criminal's charges.",
  type: ApplicationCommandType.ChatInput,
  //userRoles: [process.env.POLICE_ROLE_ID],
  options: [
    {
      name: "indictment",
      description: "The indictment number of the charge(s).",
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
    const indictmentId = interaction.options.get("indictment").value;

    try {
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

        return interaction.reply({
          embeds: [indictmentNotFoundEmbed],
          ephemeral: true,
        });
      }

      // Check if the indictment has already been expunged
      if (!!indictment.expunged) {
        const alreadyExpungedEmbed = new EmbedBuilder()
          .setTitle("Indictment Already Expunged")
          .setDescription(
            `The indictment ID, **${indictmentId}**, has already been expunged.`
          )
          .setColor("Red")
          .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL(),
          });

        return interaction.reply({
          embeds: [alreadyExpungedEmbed],
          ephemeral: true,
        });
      }

      // Expunge the indictment in the database
      await db.update(criminalIndictments).set({ expunged: true }).where({ id: indictmentId });

      // Edit the indictment embed to show that it has been expunged
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
      const indictmentEmbed = EmbedBuilder.from(indictmentMessage.embeds[0]);

      indictmentEmbed.setTitle("Indictment Expunged").setDescription(`~~${indictmentEmbed.data.description}~~`).setColor("Red");

      await indictmentMessage.edit({ embeds: [indictmentEmbed] });

      const successEmbed = new EmbedBuilder()
        .setTitle("Indictment Expunged")
        .setDescription(`The indictment ID, **${indictmentId}**, has been expunged.`)
        .setColor("Green")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
      return interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      log.error("An error occurred while expunging a criminal's charges.", error);

      const errorEmbed = new EmbedBuilder()
        .setTitle("An Error Occurred")
        .setDescription("An error occurred while expunging a criminal's charges.")
        .setColor("Red")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
