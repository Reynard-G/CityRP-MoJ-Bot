const {
  Client,
  ModalSubmitInteraction,
  EmbedBuilder,
  ThreadAutoArchiveDuration,
} = require("discord.js");
const db = require("../lib/db");
const { criminals } = require("../drizzle/schema");
const log = require("../logger");

module.exports = {
  id: "criminalRecordModal",
  permissions: [],
  /**
   * @param {Client} client
   * @param {ModalSubmitInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const name = interaction.fields.getTextInputValue(
        "criminalRecordModal-nameInput"
      );

      // Check if `name` record already exists in the database
      const record = await db
        .select()
        .from(criminals)
        .where({ username: name });
      const recordFoundEmbed = new EmbedBuilder()
        .setTitle("Criminal Record Found")
        .setDescription(`A criminal record already exists for **${name}**.`)
        .setColor("Red")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });

      if (record.length > 0)
        return interaction.reply({
          embeds: [recordFoundEmbed],
          ephemeral: true,
        });

      // Insert the record into the database
      const recordResult = await db
        .insert(criminals)
        .values({ username: name, thread_id: "" });

      // Get the channel and create forum post
      const forumChannel = interaction.guild.channels.cache.get(
        process.env.RECORDS_AUDIT_CHANNEL_ID
      );
      const thread = await forumChannel.threads.create({
        name: `Record #${recordResult[0].insertId} • ${name}`,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
        message: {
          content: `Criminal record for user \`${name}\` is below:`,
        },
      });

      // Update the record with the thread ID
      await db
        .update(criminals)
        .set({ thread_id: thread.id })
        .where({ id: recordResult[0].insertId });

      const recordEmbed = new EmbedBuilder()
        .setTitle("Criminal Record Filed")
        .setDescription(`A criminal record has been filed for **${name}**.`)
        .setColor("Green")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
      return interaction.reply({ embeds: [recordEmbed], ephemeral: true });
    } catch (error) {
      log.error("An error occurred while filing the criminal record.", error);

      const errorEmbed = new EmbedBuilder()
        .setTitle("An Error Occurred")
        .setDescription("An error occurred while filing the criminal record.")
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
