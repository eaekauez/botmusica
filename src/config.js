const path = require('node:path');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  token: requireEnv('DISCORD_TOKEN'),
  clientId: requireEnv('DISCORD_CLIENT_ID'),
  guildId: process.env.DISCORD_GUILD_ID || '',
  prefix: process.env.PREFIX || '!',
  cookieFilePath: process.env.YTDLP_COOKIE_FILE || '/tmp/youtube-cookies.txt',
  ytDlpBinary: process.env.YTDLP_BINARY || 'yt-dlp',
  ffmpegPath: process.env.FFMPEG_PATH || require('ffmpeg-static'),
  defaultVolume: Number(process.env.DEFAULT_VOLUME || '0.65'),
  maxQueueSize: Number(process.env.MAX_QUEUE_SIZE || '100'),
  commandFolder: path.join(__dirname, 'commands'),
};
