import * as cheerio from 'cheerio';

const buildMovieStruct = ($movie, $) => {
	const seances = [];
	$movie.find('button[data-seancedate]').each(function() {
		const $this = $(this);

		const hour = $this.attr('data-seancehour');
		const version = $this.attr('data-version');
		const film = $this.attr('data-film');
		const gender = $this.attr('data-filmgender');

		seances.push({
			hour,
			version,
			film,
			gender,
		});
	});

	return seances.reduce((acc, cur) => {
		acc['film'] = cur.film;
		acc['gender'] = cur.gender;

		const seance = { hour: cur.hour, version: cur.version };

		if ('seances' in acc) {
			acc['seances'].push(seance);
		}
		else {
			acc['seances'] = [seance];
		}

		return acc;
	}, {});
};

const seanceHourToDate = (seanceHour) => {
	const [ startHours, startMinutes ] = seanceHour.split(':');
	return new Date(1970, 0, 1, startHours, startMinutes);
};

export const theaters = {
	'confluence': 36,
	'partDieu': 58,
};

export const getMovies = async (date, cinemaId) => {
	const response = await fetch(`https://www.ugc.fr/showingsCinemaAjaxAction!getShowingsForCinemaPage.action?cinemaId=${cinemaId}&date=${date}`);
	const html = await response.text();

	const $ = cheerio.load(html);

	const movies = [];
	$('.component--cinema-list-item').each(function() {
		movies.push(buildMovieStruct($(this), $));
	});

	return movies.filter(elem => Object.keys(elem).length);
};

export const filterStartTimeAfter = (movieList, timeThreshold) => {
	const thresholdDate = seanceHourToDate(timeThreshold);

	const filteredMovies = [];
	movieList.forEach(movie => {
		const matchingSeances = movie.seances.filter(seance => {
			const seanceDate = seanceHourToDate(seance.hour);
			return seanceDate >= thresholdDate;
		});

		if (matchingSeances != []) filteredMovies.push({ ...movie, seances: matchingSeances });
	});

	return filteredMovies;
};

export const formatList = (movieList) => {
	let output = '';

	movieList.forEach(movie => {
		const movieLine = `**${movie.film} - ${movie.gender}**`;
		const seances = movie.seances.reduce((acc, seance) => {
			return acc + `* ${seance.hour} - ${seance.version}\n`;
		}, '');
		output += `\n${movieLine}\n${seances}`;
	});

	return output;
};
