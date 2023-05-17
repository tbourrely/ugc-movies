import { REST, Routes } from 'discord.js';
import config from './config.json' assert {type: 'json'};
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const { clientId, guildId, token } = config;

const commands = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Grab all the command files from the commands directory you created earlier
// TODO: avoid duplication of command files loading
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.mjs'));
for (const file of commandFiles) {
	const filePath = path.join(foldersPath, file);
	const importedCommand = await import(filePath);
	const command = importedCommand.default;
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

