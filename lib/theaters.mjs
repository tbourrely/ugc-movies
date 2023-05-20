import * as cheerio from 'cheerio';

const buildMovieStruct = ($movie, $, cinemaId) => {
	const seances = [];
	$movie.find('button[data-seancedate]').each(function() {
		const $this = $(this);

		const hour = $this.attr('data-seancehour');
		const version = $this.attr('data-version');
		const film = $this.attr('data-film');
		const gender = $this.attr('data-filmgender');
		const id = $this.attr('data-filmid');

		seances.push({
			hour,
			version,
			film,
			gender,
			id,
		});
	});

	return seances.reduce((acc, cur) => {
		acc['film'] = cur.film;
		acc['gender'] = cur.gender;
		acc['page'] = generatePageLink(cur.id);

		const seance = { hour: cur.hour, version: cur.version, theater: cinemaId };

		if ('seances' in acc) {
			acc['seances'].push(seance);
		}
		else {
			acc['seances'] = [seance];
		}

		return acc;
	}, {});
};

const generatePageLink = (filmId) => `https://www.ugc.fr/film.html?id=${filmId}`;

const seanceHourToDate = (seanceHour) => {
	const [ startHours, startMinutes ] = seanceHour.split(':');
	return new Date(1970, 0, 1, startHours, startMinutes);
};

export const theaters = {
	'confluence': 36,
	'partDieu': 58,
};

const getTheaterById = id => {
	for (const [key, value] of Object.entries(theaters)) {
		if (value === id) return key;
	}

	return undefined;
};

export const buildMovieList = async (date, cinemaId) => {
	const response = await fetch(`https://www.ugc.fr/showingsCinemaAjaxAction!getShowingsForCinemaPage.action?cinemaId=${cinemaId}&date=${date}`);
	const html = await response.text();

	const $ = cheerio.load(html);

	const movies = [];
	$('.component--cinema-list-item').each(function() {
		movies.push(buildMovieStruct($(this), $, cinemaId));
	});

	return movies.filter(elem => Object.keys(elem).length);
};

export const mergeMovieLists = (lists = []) => {
	const firstList = lists.shift();

	const movieList = {};
	for (const movie of firstList) {
		movieList[movie.film] = movie;
	}

	for (const list of lists) {
		const movieTitles = Object.keys(movieList);

		for (const movie of list) {
			if (movieTitles.includes(movie.film)) {
				movieList[movie.film].seances = [
					...movieList[movie.film].seances,
					...movie.seances,
				];
			}
			else {
				movieList[movie.film] = movie;
			}
		}
	}

	return Object.values(movieList);
};

export const getMovies = async (date, theathers = []) => {
	const requests = [];
	theathers.forEach(theater => {
		requests.push(buildMovieList(date, theater));
	});

	const lists = await Promise.all(requests);
	return mergeMovieLists(lists);
};

export const filterStartTimeAfter = (movieList, timeThreshold) => {
	const thresholdDate = seanceHourToDate(timeThreshold);
	const filtered = [];

	for (const movie of movieList) {
		const matchingSeances = movie.seances.filter(seance => {
			const seanceDate = seanceHourToDate(seance.hour);
			return seanceDate >= thresholdDate;
		});

		if (matchingSeances.length) filtered.push({ ...movie, seances: matchingSeances });
	}

	return filtered;
};

export const filterLanguage = (movieList, language) => {
	const filtered = [];

	for (const movie of movieList) {
		const matchingSeances = movie.seances.filter(seance => {
			return seance.version == language;
		});

		if (matchingSeances.length) filtered.push({ ...movie, seances: matchingSeances });
	}

	return filtered;
};

export const isAllSameTheater = (list) => {
	let currentTheater;

	for (let movieIndex = 0; movieIndex < list.length; movieIndex++) {
		const movie = list[movieIndex];
		for (let seanceIndex = 0; seanceIndex < movie.seances.length; seanceIndex++) {
			if (movieIndex === 0 && seanceIndex === 0) {
				currentTheater = movie.seances[seanceIndex].theater;
				continue;
			}

			if (currentTheater !== movie.seances[seanceIndex].theater) return false;
		}
	}

	return true;
};

export const formatList = (movieList) => {
	let output = '';

	const sameTheater = isAllSameTheater(movieList);

	movieList.forEach((movie, index) => {
		const movieLine = `**[${movie.film} - ${movie.gender}](${movie.page})**`;
		const seances = movie.seances.reduce((acc, seance) => {
			let seanceString = `- ${seance.hour} - ${seance.version}`;
			if (!sameTheater) seanceString += ` (${getTheaterById(seance.theater)})`;
			return acc + seanceString + '\n';
		}, '');
		// do not start message with a new line character
		const newLineStart = index === 0 ? '' : '\n';
		output += `${newLineStart}${movieLine}\n${seances}`;
	});

	return output;
};

export const splitFormattedList = (text, maxLength) => {
	if (text.length <= maxLength) return [text];

	const parts = [];
	const movies = text.split('\n\n');

	for (const movie of movies) {
		// first movie, nothing to do
		if (parts.length === 0) {
			parts.push(movie);
			continue;
		}

		// try to join movies if length acceptable, add as new part otherwise
		// implementation assumes that a movie block cannot exceed maxLength
		const currentPartsIndex = parts.length - 1;
		const currentPartLength = parts[currentPartsIndex].length;
		const movieLength = movie.length;
		if (currentPartLength + movieLength < maxLength) {
			const joinedContent = `${parts[currentPartsIndex]}\n\n${movie}`;
			parts[currentPartsIndex] = joinedContent;
		}
		else {
			parts.push(movie);
		}
	}

	return parts;
};
