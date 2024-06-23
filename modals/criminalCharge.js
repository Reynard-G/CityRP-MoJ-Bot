const { Client, ModalSubmitInteraction, EmbedBuilder } = require("discord.js");
const ms = require("ms");
const db = require("../lib/db");
const { criminals, criminalIndictments } = require("../drizzle/schema");
const log = require("../logger");

module.exports = {
  id: "criminalChargeModal",
  permissions: [],
  /**
   * @param {Client} client
   * @param {ModalSubmitInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const name = interaction.fields.getTextInputValue(
        "criminalChargeModal-nameInput"
      );
      const charges = interaction.fields.getTextInputValue(
        "criminalChargeModal-chargesInput"
      );
      const jailTime = interaction.fields.getTextInputValue(
        "criminalChargeModal-jailTimeInput"
      );
      const fine = interaction.fields.getTextInputValue(
        "criminalChargeModal-fineInput"
      );
      const summary = interaction.fields.getTextInputValue(
        "criminalChargeModal-summaryInput"
      );

      // Check if `name` record already exists in the database
      const record = await db
        .select()
        .from(criminals)
        .where({ username: name });
      const recordNotFoundEmbed = new EmbedBuilder()
        .setTitle("Criminal Record Not Found")
        .setDescription(`A criminal record does not exist for **${name}**.`)
        .setColor("Red")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });

      if (record.length === 0)
        return interaction.reply({
          embeds: [recordNotFoundEmbed],
          ephemeral: true,
        });

      // Check if fine is a valid number/amount
      if (isNaN(parseFloat(fine.replace(/[$,]/g, "")))) {
        const fineInvalidEmbed = new EmbedBuilder()
          .setTitle("Invalid Fine Amount")
          .setDescription(
            "The fine amount must be a valid number/amount. Ex: $1000.00, 1,000.00, etc."
          )
          .setColor("Red")
          .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL(),
          });

        return interaction.reply({
          embeds: [fineInvalidEmbed],
          ephemeral: true,
        });
      }

      // Insert the charge into the database
      const chargeResult = await db.insert(criminalIndictments).values({
        criminal_id: record[0].id,
        officer_discord_id: interaction.user.id,
        charges: charges,
        jailTime: ms(jailTime),
        fine: parseFloat(fine.replace(/[^0-9.-]/g, "")), // Strip everything except numbers, decimals, and negative signs
        summary: summary || null,
      });

      // Get the channel and create message
      const forumChannel = interaction.guild.channels.cache.get(
        process.env.RECORDS_AUDIT_CHANNEL_ID
      );
      const threadChannel = forumChannel.threads.cache.get(record[0].thread_id);
      const chargeEmbed = new EmbedBuilder()
        .setTitle("Criminal Charge Filed")
        .setDescription(`A criminal charge has been filed for **${name}**.`)
        .setFields([
          {
            name: "Officer",
            value: `<@${interaction.user.id}> (${interaction.user.tag})`,
          },
          {
            name: "Charges",
            value: charges,
          },
          {
            name: "Jail Time",
            value: ms(ms(jailTime), { long: true }), // Standardize the time format
          },
          {
            name: "Fine",
            value: `${Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(parseFloat(fine.replace(/[^0-9.-]/g, "")))}`,
          },
          {
            name: "Summary",
            value: summary || "N/A",
          },
        ])
        .setColor(0x135dd8)
        .setFooter({
          text: `${interaction.guild.name} • Indictment #${chargeResult[0].insertId}`,
          iconURL: interaction.guild.iconURL(),
        });
      const chargeMessage = await threadChannel.send({
        embeds: [chargeEmbed],
      });

      // Update the charge with the message ID
      await db
        .update(criminalIndictments)
        .set({ message_id: chargeMessage.id })
        .where({ id: chargeResult[0].insertId });

      const chargeFiledEmbed = new EmbedBuilder()
        .setTitle("Criminal Charge Filed")
        .setDescription(
          `
          The criminal charge for **${name}** has successfully been filed.\n
          View the criminal record: <#${chargeMessage.channel.id}>.
        `
        )
        .setColor("Green")
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
      return interaction.reply({ embeds: [chargeFiledEmbed], ephemeral: true });
    } catch (error) {
      console.log(error);
      log.error("An error occurred while filing the criminal charge.", error);

      const errorEmbed = new EmbedBuilder()
        .setTitle("An Error Occurred")
        .setDescription("An error occurred while filing the criminal charge.")
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
