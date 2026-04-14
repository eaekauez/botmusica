const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { resolveTrack } = require('../core/ytDlp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Busca uma música pelo nome do artista/faixa e toca no canal de voz.')
    .addStringOption((option) =>
      option
        .setName('busca')
        .setDescription('Ex.: Matuê 333 ou um link do YouTube')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction, context) {
    const memberChannel = interaction.member.voice?.channel;
    if (!memberChannel) {
      await interaction.reply({ content: '❌ Entre em um canal de voz antes de usar /play.', ephemeral: true });
      return;
    }

    const permissions = memberChannel.permissionsFor(interaction.client.user);
    if (!permissions?.has(PermissionFlagsBits.Connect) || !permissions?.has(PermissionFlagsBits.Speak)) {
      await interaction.reply({ content: '❌ Eu preciso de permissão para conectar e falar nesse canal.', ephemeral: true });
      return;
    }

    const query = interaction.options.getString('busca', true).trim();

    await interaction.deferReply();

    let track;
    try {
      track = await resolveTrack(query, interaction.user.username);
    } catch (error) {
      await interaction.editReply(`❌ Não consegui localizar essa música. Motivo: ${error.message}`);
      return;
    }

    const player = context.playerManager.getOrCreate(interaction.guildId);
    try {
      if (!player.connection) {
        await player.connect(memberChannel, interaction.channel);
      }

      player.enqueue(track);
      const wasIdle = !player.current;
      if (wasIdle) {
        void player.playNext();
      }

      await interaction.editReply(
        wasIdle
          ? `🔎 Encontrada e iniciando: **${track.title}**`
          : `✅ Adicionada à fila: **${track.title}**`
      );
    } catch (error) {
      context.playerManager.delete(interaction.guildId);
      await interaction.editReply(`❌ Falha ao tocar no canal de voz: ${error.message}`);
    }
  },
};
