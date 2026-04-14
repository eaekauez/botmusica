const { GuildPlayer } = require('./guildPlayer');

class PlayerManager {
  constructor() {
    this.players = new Map();
  }

  get(guildId) {
    return this.players.get(guildId) || null;
  }

  getOrCreate(guildId) {
    if (!this.players.has(guildId)) {
      this.players.set(guildId, new GuildPlayer(guildId));
    }
    return this.players.get(guildId);
  }

  delete(guildId) {
    const player = this.players.get(guildId);
    if (player) {
      player.destroy();
      this.players.delete(guildId);
    }
  }
}

module.exports = { PlayerManager };
