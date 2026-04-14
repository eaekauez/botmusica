# Discord Music Bot Pro

Bot de música para Discord com comandos de barra, fila por servidor, busca por nome da música/artista e reprodução em canal de voz.

## O que ele faz

- Busca músicas com `/play busca:<artista música>`
- Também aceita link do YouTube em `/play`
- Mantém fila por servidor
- Comandos: `/play`, `/skip`, `/pause`, `/resume`, `/queue`, `/nowplaying`, `/stop`, `/leave`, `/help`
- Feito com `discord.js`, `@discordjs/voice`, `yt-dlp` e `ffmpeg`
- Estruturado para rodar 24/7 em Docker/Railway

## Requisitos

- Node.js 20+
- Um bot criado no Discord Developer Portal
- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- Opcional: `DISCORD_GUILD_ID` para registrar comandos rapidamente só no seu servidor
- Opcional mas recomendado: `YTDLP_COOKIES_B64` com cookies exportados do YouTube em base64

## Variáveis de ambiente

- `DISCORD_TOKEN` — token do bot
- `DISCORD_CLIENT_ID` — application/client ID do bot
- `DISCORD_GUILD_ID` — ID do seu servidor para registrar comandos locais mais rápido
- `YTDLP_COOKIES_B64` — cookies do YouTube exportados e convertidos para base64
- `YTDLP_COOKIE_FILE` — caminho do arquivo de cookies, padrão `/tmp/youtube-cookies.txt`
- `YTDLP_BINARY` — caminho/binário do yt-dlp, padrão `yt-dlp`
- `FFMPEG_PATH` — caminho do ffmpeg; no Docker já vem instalado
- `DEFAULT_VOLUME` — padrão `0.65`
- `MAX_QUEUE_SIZE` — padrão `100`

## Como registrar os slash commands

Primeiro instale as dependências localmente:

```bash
npm install
```

Depois registre os comandos:

```bash
npm run register
```

Se `DISCORD_GUILD_ID` estiver definido, o registro será feito só naquele servidor e costuma aparecer quase na hora.

## Como rodar localmente

```bash
npm install
npm run register
npm start
```

## Como subir no Railway com Docker

1. Suba estes arquivos para um repositório GitHub.
2. Crie um projeto no Railway usando o repositório.
3. Habilite o deploy por Dockerfile.
4. Configure as variáveis de ambiente.
5. Rode `npm run register` localmente uma vez ou em um shell do deploy para registrar os comandos.

## Permissões do bot

No Discord Developer Portal, ative o escopo `bot` e `applications.commands` no link de convite. No servidor, garanta que o bot tenha pelo menos:

- Connect
- Speak
- View Channel
- Use Application Commands

## Observação importante sobre YouTube

Busca e reprodução com YouTube em hospedagem compartilhada podem sofrer limitação anti-bot. Usar cookies válidos do YouTube reduz bastante esse problema, mas não elimina 100% em todo provedor cloud.
