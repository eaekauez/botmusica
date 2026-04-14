const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Mostra a música atual.'),

  async execute(interaction, context) {
    const player = context.playerManager.get(interaction.guildId);
    if (!player?.current) {
      await interaction.reply({ content: '❌ Não há música tocando agora.', ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [player.nowPlayingEmbed()] });
  },
};
