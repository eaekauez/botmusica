const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Retoma a reprodução pausada.'),

  async execute(interaction, context) {
    const player = context.playerManager.get(interaction.guildId);
    if (!player?.current) {
      await interaction.reply({ content: '❌ Não há música pausada agora.', ephemeral: true });
      return;
    }

    const resumed = player.resume();
    await interaction.reply(resumed ? '▶️ Reprodução retomada.' : '❌ Não foi possível retomar agora.');
  },
};
