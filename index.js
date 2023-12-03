const {
    ActivityType,
    Client,
    Collection,
    Events,
    GatewayIntentBits,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] }); // Creates a new Discord client
module.exports = client;

require('./events/status.js');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('the tide', { type: 'WATCHING' });
})

client.on('error', () => {
    console.log('Bot encountered an error: ', error);
})

// Loads all commands from the commands folder
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Loops through each folder in the commands folder
for (const folder of commandFolders) {
	// Loops through each file in the folder
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		// Requires the command and adds it to the client
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

// Handles slash commands
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return; // Ignores non-slash commands

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		// If the command doesn't exist, log it and return
		console.error(
			`No command matching ${interaction.commandName} was found.`,
		);
		return;
	}

	try {
		// Tries to execute the command
		await command.execute(interaction);
	} catch (error) {
		// If there's an error, log it and send a message to the user
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	}
});

client.login(process.env.TOKEN);