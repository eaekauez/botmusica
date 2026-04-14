const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Mostra a fila de reprodução.'),

  async execute(interaction, context) {
    const player = context.playerManager.get(interaction.guildId);
    if (!player) {
      await interaction.reply({ content: '📭 Nenhuma fila ativa neste servidor.', ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [player.queueEmbed()] });
  },
};
