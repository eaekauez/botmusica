const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Mostra os comandos do bot.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎧 Comandos do bot de música')
      .setDescription([
        '`/play busca:<artista música>` — pesquisa e toca',
        '`/skip` — pula a atual',
        '`/pause` — pausa',
        '`/resume` — retoma',
        '`/queue` — mostra fila',
        '`/nowplaying` — música atual',
        '`/stop` — para tudo e limpa a fila',
        '`/leave` — sai do canal',
      ].join('\n'));

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
