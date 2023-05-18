import { SlashCommandBuilder } from 'discord.js';
import { theaters, getMovies, formatList } from '../lib/theaters.mjs';
import { getTomorrowDate } from '../lib/date.mjs';

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
		await interaction.reply(formatted);
		// FIXME: max length issue with part dieu
	},
};
