import { SlashCommandBuilder } from 'discord.js';
import { theaters, getMovies, formatList, splitFormattedList } from '../lib/theaters.mjs';
import { getTomorrowDate } from '../lib/date.mjs';
import { MAX_MESSAGE_LENGTH } from '../constants.js';

const cinemaChoices = Object.keys(theaters).map(element => ({ name: element, value: theaters[element] }));

export default {
	data: new SlashCommandBuilder()
		.setName('films')
		.setDescription('Liste des films dans le cinema')
		.addNumberOption(option =>
			option.setName('cinema')
				.setDescription('Le cinema')
				.setRequired(true)
				.addChoices(...cinemaChoices),
		),
	async execute(interaction) {
		const cinema = interaction.options.getNumber('cinema');

		const rawMovieList = await getMovies(getTomorrowDate(), cinema);
		const formatted = formatList(rawMovieList);
		const parts = splitFormattedList(formatted, MAX_MESSAGE_LENGTH);
		const firstPart = parts.shift();

		await interaction.reply(firstPart);
		for (const part of parts) {
			await interaction.followUp(part);
		}
	},
};
