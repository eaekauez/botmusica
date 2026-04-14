const { execFile, spawn } = require('node:child_process');
const { promisify } = require('node:util');
const { Track } = require('./track');
const logger = require('../utils/logger');
const config = require('../config');

const execFileAsync = promisify(execFile);

function baseArgs() {
  const args = [];
  if (process.env.YTDLP_COOKIES || process.env.YTDLP_COOKIES_B64 || process.env.YTDLP_COOKIE_FILE) {
    args.push('--cookies', config.cookieFilePath);
  }
  return args;
}

async function runYtDlp(args) {
  const finalArgs = [...baseArgs(), ...args];
  const { stdout } = await execFileAsync(config.ytDlpBinary, finalArgs, {
    maxBuffer: 1024 * 1024 * 16,
  });
  return stdout;
}

async function searchTrack(query, requestedBy) {
  const stdout = await runYtDlp([
    '--dump-single-json',
    '--no-playlist',
    `ytsearch1:${query}`,
  ]);

  const raw = JSON.parse(stdout);
  const entry = raw.entries?.[0] || raw;
  if (!entry?.webpage_url) {
    throw new Error('Nenhum resultado encontrado para a pesquisa.');
  }

  return new Track({
    title: entry.title || 'Sem título',
    url: entry.webpage_url,
    sourceUrl: entry.webpage_url,
    requestedBy,
    durationSeconds: Number(entry.duration || 0),
  });
}

async function resolveTrack(input, requestedBy) {
  const isUrl = /^https?:\/\//i.test(input);
  if (isUrl) {
    const stdout = await runYtDlp([
      '--dump-single-json',
      '--no-playlist',
      input,
    ]);
    const raw = JSON.parse(stdout);
    return new Track({
      title: raw.title || 'Sem título',
      url: raw.webpage_url || input,
      sourceUrl: raw.webpage_url || input,
      requestedBy,
      durationSeconds: Number(raw.duration || 0),
    });
  }

  return searchTrack(input, requestedBy);
}

function createAudioProcess(url) {
  const ytdlpArgs = [
    ...baseArgs(),
    '-f',
    'bestaudio[ext=webm]/bestaudio/best',
    '--no-playlist',
    '-o',
    '-',
    url,
  ];

  const ffmpegArgs = [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    'pipe:0',
    '-analyzeduration',
    '0',
    '-fflags',
    'nobuffer',
    '-f',
    's16le',
    '-ar',
    '48000',
    '-ac',
    '2',
    'pipe:1',
  ];

  const yt = spawn(config.ytDlpBinary, ytdlpArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const ffmpeg = spawn(config.ffmpegPath, ffmpegArgs, {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  yt.stdout.pipe(ffmpeg.stdin);

  yt.stderr.on('data', (chunk) => logger.warn(`yt-dlp: ${chunk.toString().trim()}`));
  ffmpeg.stderr.on('data', (chunk) => logger.warn(`ffmpeg: ${chunk.toString().trim()}`));

  yt.on('error', (error) => logger.error('yt-dlp process error', error));
  ffmpeg.on('error', (error) => logger.error('ffmpeg process error', error));

  const cleanup = () => {
    if (!yt.killed) {
      yt.kill('SIGKILL');
    }
    if (!ffmpeg.killed) {
      ffmpeg.kill('SIGKILL');
    }
  };

  yt.on('close', () => {
    try {
      ffmpeg.stdin.end();
    } catch {
      // ignore broken pipe during cleanup
    }
  });

  return {
    stream: ffmpeg.stdout,
    cleanup,
  };
}

module.exports = {
  resolveTrack,
  createAudioProcess,
};
