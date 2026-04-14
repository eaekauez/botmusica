const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Para a reprodução, limpa a fila e sai do canal.'),

  async execute(interaction, context) {
    const player = context.playerManager.get(interaction.guildId);
    if (!player) {
      await interaction.reply({ content: '❌ Não há reprodução ativa.', ephemeral: true });
      return;
    }

    player.stop();
    context.playerManager.delete(interaction.guildId);
    await interaction.reply('⏹️ Reprodução encerrada e fila limpa.');
  },
};
