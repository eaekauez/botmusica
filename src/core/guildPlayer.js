const {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  StreamType,
} = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');
const { createAudioProcess } = require('./ytDlp');

class GuildPlayer {
  constructor(guildId) {
    this.guildId = guildId;
    this.queue = [];
    this.current = null;
    this.connection = null;
    this.textChannel = null;
    this.voiceChannelId = null;
    this.subscription = null;
    this.processCleanup = null;
    this.volume = config.defaultVolume;

    this.audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    this.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
      this.current = null;
      this.cleanupProcess();
      await this.playNext();
    });

    this.audioPlayer.on('error', async (error) => {
      logger.error(`Audio player error for guild ${this.guildId}`, error);
      if (this.textChannel) {
        await this.textChannel.send('❌ Ocorreu um erro ao tocar a música. Pulando para a próxima.');
      }
      this.current = null;
      this.cleanupProcess();
      await this.playNext();
    });
  }

  async connect(voiceChannel, textChannel) {
    this.textChannel = textChannel;
    this.voiceChannelId = voiceChannel.id;

    this.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    this.connection.on('stateChange', (oldState, newState) => {
      logger.info(`Voice state ${this.guildId}: ${oldState.status} -> ${newState.status}`);
    });

    this.connection.on('error', (error) => {
      logger.error(`Voice connection error for guild ${this.guildId}`, error);
    });

    await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);
    this.subscription = this.connection.subscribe(this.audioPlayer);
  }

  enqueue(track) {
    if (this.queue.length >= config.maxQueueSize) {
      throw new Error(`A fila atingiu o limite de ${config.maxQueueSize} músicas.`);
    }
    this.queue.push(track);
  }

  nowPlayingEmbed() {
    if (!this.current) return null;
    return new EmbedBuilder()
      .setTitle('🎶 Tocando agora')
      .setDescription(`**${this.current.title}**`)
      .addFields(
        { name: 'Duração', value: this.current.durationLabel(), inline: true },
        { name: 'Pedido por', value: this.current.requestedBy, inline: true },
        { name: 'Fonte', value: this.current.sourceUrl }
      );
  }

  queueEmbed() {
    const embed = new EmbedBuilder().setTitle('📜 Fila de reprodução');

    if (this.current) {
      embed.addFields({
        name: 'Agora',
        value: `**${this.current.title}** — ${this.current.requestedBy}`,
      });
    }

    if (this.queue.length === 0) {
      embed.setDescription('Nenhuma música na fila.');
      return embed;
    }

    embed.setDescription(
      this.queue
        .slice(0, 10)
        .map((track, index) => `${index + 1}. ${track.title} — ${track.requestedBy}`)
        .join('\n')
    );

    if (this.queue.length > 10) {
      embed.setFooter({ text: `E mais ${this.queue.length - 10} música(s) na fila.` });
    }

    return embed;
  }

  async playNext() {
    if (!this.connection || this.connection.state.status === VoiceConnectionStatus.Destroyed) {
      return;
    }

    const next = this.queue.shift();
    if (!next) {
      if (this.textChannel) {
        await this.textChannel.send('📭 A fila terminou. Saindo do canal de voz.');
      }
      this.destroy();
      return;
    }

    this.current = next;

    const { stream, cleanup } = createAudioProcess(next.url);
    this.processCleanup = cleanup;

    const resource = createAudioResource(stream, {
      inputType: StreamType.Raw,
      inlineVolume: true,
    });

    resource.volume.setVolume(this.volume);
    this.audioPlayer.play(resource);

    if (this.textChannel) {
      await this.textChannel.send({ embeds: [this.nowPlayingEmbed()] });
    }
  }

  pause() {
    return this.audioPlayer.pause(true);
  }

  resume() {
    return this.audioPlayer.unpause();
  }

  skip() {
    return this.audioPlayer.stop(true);
  }

  stop() {
    this.queue = [];
    this.audioPlayer.stop(true);
    this.destroy();
  }

  cleanupProcess() {
    if (this.processCleanup) {
      this.processCleanup();
      this.processCleanup = null;
    }
  }

  destroy() {
    this.cleanupProcess();
    this.current = null;
    this.queue = [];
    try {
      this.subscription?.unsubscribe();
    } catch {
      // ignore
    }
    try {
      this.connection?.destroy();
    } catch {
      // ignore
    }
    this.connection = null;
  }
}

module.exports = { GuildPlayer };
