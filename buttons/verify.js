module.exports = {
  id: "verify_button",
  permissions: [],
  run: async (client, interaction) => {
    await interaction.member.roles.add("ROLE_ID");
    if (interaction.member.roles.cache.get("ROLE_ID"))
      return interaction.reply({
        content: `${interaction.user}, You were already verified.`,
        ephemeral: true,
      });
    return interaction.reply({
      content: `✅ ${interaction.user}, You are verified.`,
      ephemeral: true,
    });
  },
};
