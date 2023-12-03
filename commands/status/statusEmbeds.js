const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Get server info for Tide'),
    async execute(interaction) {
        const embed1 = new EmbedBuilder()
            .setTitle('Tide')
            .setDescription('Fetching server info...')
            .setColor('Blue')
        const embed2 = new EmbedBuilder()
            .setTitle('Tide')
            .setDescription('Fetching player info...')
            .setColor('Blue')
        const message = await interaction.reply({ embeds: [embed1, embed2] });
    },
};