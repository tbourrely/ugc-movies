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
