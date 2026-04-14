const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa a reprodução atual.'),

  async execute(interaction, context) {
    const player = context.playerManager.get(interaction.guildId);
    if (!player?.current) {
      await interaction.reply({ content: '❌ Não há música tocando agora.', ephemeral: true });
      return;
    }

    const paused = player.pause();
    await interaction.reply(paused ? '⏸️ Reprodução pausada.' : '❌ Não foi possível pausar agora.');
  },
};
