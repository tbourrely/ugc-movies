import { getTomorrowDate } from './date.mjs';
import { getMovies, theaters } from './theaters.mjs';

async function main() {
	const date = getTomorrowDate();

	// FIXME: parallelize requests
	const movies = {};
	for (const theater in theaters) {
		movies[theater] = await getMovies(date, theaters[theater]);
	}

	console.log(movies);
}

main();
