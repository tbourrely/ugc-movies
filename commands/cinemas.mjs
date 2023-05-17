import { SlashCommandBuilder } from 'discord.js';
import { theaters } from '../lib/theaters.mjs';

export default {
	data: new SlashCommandBuilder()
		.setName('cinemas')
		.setDescription('Liste des cinemas'),
	async execute(interaction) {
		await interaction.reply(Object.keys(theaters).join(', '));
	},
};
