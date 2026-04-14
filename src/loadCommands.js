const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

function loadCommands() {
  const commands = new Map();
  const files = fs.readdirSync(config.commandFolder).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const command = require(path.join(config.commandFolder, file));
    commands.set(command.data.name, command);
  }

  return commands;
}

function serializeCommands(commands) {
  return Array.from(commands.values()).map((command) => command.data.toJSON());
}

module.exports = { loadCommands, serializeCommands };
