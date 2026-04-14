const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Faz o bot sair do canal de voz.'),

  async execute(interaction, context) {
    const player = context.playerManager.get(interaction.guildId);
    if (!player) {
      await interaction.reply({ content: '❌ Não estou em nenhum canal de voz.', ephemeral: true });
      return;
    }

    player.stop();
    context.playerManager.delete(interaction.guildId);
    await interaction.reply('👋 Saí do canal de voz.');
  },
};
