import { SlashCommandBuilder, bold } from 'discord.js';
import { theaters, getMovies } from '../lib/theaters.mjs';
import { getTomorrowDate } from '../lib/date.mjs';

const cinemaChoices = Object.keys(theaters).map(element => ({ name: element, value: theaters[element] }));

const format = (movieList) => {
	let output = '';

	movieList.forEach(movie => {
		const movieLine = bold(`${movie.film} - ${movie.gender}`);
		const seances = movie.seances.reduce((acc, seance) => {
			return acc + `* ${seance.hour} - ${seance.version}\n`;
		}, '');
		output += `\n${movieLine}\n${seances}`;
	});

	return output;
};

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
		const formatted = format(rawMovieList);
		await interaction.reply(formatted);
		// FIXME: max length issue with part dieu
	},
};
