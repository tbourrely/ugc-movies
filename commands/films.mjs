import { SlashCommandBuilder } from 'discord.js';
import { theaters, getMovies, formatList, splitFormattedList, filterStartTimeAfter } from '../lib/theaters.mjs';
import { getTomorrowDate, fromDayMonth } from '../lib/date.mjs';
import { isValid } from '../lib/time.mjs';
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
		)
		.addStringOption(option =>
			option.setName('date')
				.setDescription('Date souhaitee (31/12)')
				.setMinLength(5)
				.setMaxLength(5),
		)
		.addStringOption(option =>
			option.setName('start_after')
				.setDescription('Heure de debut (18:30)')
				.setMinLength(5)
				.setMaxLength(5),
		),
	async execute(interaction) {
		const cinemaInput = interaction.options.getNumber('cinema');
		const dateInput = interaction.options.getString('date');
		const startAfterInput = interaction.options.getString('start_after');

		const date = dateInput ? fromDayMonth(dateInput) : getTomorrowDate();

		let rawMovieList = await getMovies(date, cinemaInput);

		if (rawMovieList.length == 0) {
			await interaction.reply('Pas de films pour cette date (ou pas encore...)');
			return;
		}

		if (startAfterInput && isValid(startAfterInput)) {
			rawMovieList = filterStartTimeAfter(rawMovieList, startAfterInput);
		}

		const formatted = formatList(rawMovieList);
		const parts = splitFormattedList(formatted, MAX_MESSAGE_LENGTH);
		const firstPart = parts.shift();

		await interaction.reply(firstPart);
		for (const part of parts) {
			await interaction.followUp(part);
		}
	},
};
