const { Client, GatewayIntentBits, Events } = require('discord.js');
const config = require('./config');
const logger = require('./utils/logger');
const { ensureCookieFile } = require('./utils/cookies');
const { loadCommands } = require('./loadCommands');
const { PlayerManager } = require('./core/playerManager');

ensureCookieFile(config.cookieFilePath);

const commands = loadCommands();
const playerManager = new PlayerManager();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once(Events.ClientReady, () => {
  logger.info(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: '❌ Comando não encontrado.', ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction, { playerManager });
  } catch (error) {
    logger.error(`Command ${interaction.commandName} failed`, error);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: '❌ Ocorreu um erro ao executar o comando.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Ocorreu um erro ao executar o comando.', ephemeral: true });
    }
  }
});

client.on(Events.Error, (error) => {
  logger.error('Discord client error', error);
});

client.login(config.token).catch((error) => {
  logger.error('Failed to login', error);
  process.exit(1);
});
