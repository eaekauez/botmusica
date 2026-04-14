const { REST, Routes } = require('discord.js');
const config = require('./config');
const { loadCommands, serializeCommands } = require('./loadCommands');

async function main() {
  const commands = serializeCommands(loadCommands());
  const rest = new REST({ version: '10' }).setToken(config.token);

  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: commands,
    });
    console.log(`Registered ${commands.length} guild command(s) for guild ${config.guildId}`);
    return;
  }

  await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
  console.log(`Registered ${commands.length} global command(s)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
