const fs = require('node:fs');
const logger = require('./logger');

function ensureCookieFile(cookieFilePath) {
  const base64 = process.env.YTDLP_COOKIES_B64;
  const raw = process.env.YTDLP_COOKIES;

  if (!base64 && !raw) {
    return false;
  }

  try {
    const contents = base64 ? Buffer.from(base64, 'base64').toString('utf8') : raw;
    fs.writeFileSync(cookieFilePath, contents, 'utf8');
    logger.info(`yt-dlp cookies written to ${cookieFilePath}`);
    return true;
  } catch (error) {
    logger.error('Failed to write yt-dlp cookies file', error);
    return false;
  }
}

module.exports = { ensureCookieFile };
