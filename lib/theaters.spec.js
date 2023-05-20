import { describe, expect, test, vi } from 'vitest';
import {
	buildMovieList,
	filterStartTimeAfter,
	filterLanguage,
	formatList,
	splitFormattedList,
	mergeMovieLists,
	getMovies,
	isAllSameTheater,
} from './theaters.mjs';

global.fetch = vi.fn();

function createFetchResponse(data) {
	return { text: () => new Promise((resolve) => resolve(data)) };
}

test('should get movies', async () => {
	const movieListHtml = `
<div class="component--cinema-list-item">
	<button data-filmid="1" data-seancedate="something" data-seancehour="11:15" data-version="VOSTF" data-film="top gun" data-filmgender="action">
	<button data-filmid="1" data-seancedate="something else" data-seancehour="20:20" data-version="VF" data-film="top gun" data-filmgender="action">
</div>
<div class="component--cinema-list-item">
	<button data-filmid="2" data-seancedate="something else" data-seancehour="14:20" data-version="VOSTF" data-film="suzume" data-filmgender="anime">
</div>
	`;
	fetch.mockResolvedValueOnce(createFetchResponse(movieListHtml));

	const movieListHtml2 = `
<div class="component--cinema-list-item">
	<button data-filmid="3" data-seancedate="something" data-seancehour="08:15" data-version="VOSTF" data-film="ip man" data-filmgender="action">
	<button data-filmid="3" data-seancedate="something else" data-seancehour="10:20" data-version="VF" data-film="ip man" data-filmgender="action">
</div>
<div class="component--cinema-list-item">
	<button data-filmid="2" data-seancedate="something else" data-seancehour="16:20" data-version="VOSTF" data-film="suzume" data-filmgender="anime">
</div>
	`;

	fetch.mockResolvedValueOnce(createFetchResponse(movieListHtml2));

	const movies = await getMovies('2023-05-17', [1, 2]);

	expect(movies).toEqual([
		{
			film: 'top gun',
			gender: 'action',
			page: 'https://www.ugc.fr/film.html?id=1&cinemaId=1',
			seances: [
				{
					hour: '11:15',
					version: 'VOSTF',
					theater: 1,
				},
				{
					hour: '20:20',
					version: 'VF',
					theater: 1,
				},
			],
		},
		{
			film: 'suzume',
			gender: 'anime',
			page: 'https://www.ugc.fr/film.html?id=2&cinemaId=1',
			seances: [
				{
					hour: '14:20',
					version: 'VOSTF',
					theater: 1,
				},
				{
					hour: '16:20',
					version: 'VOSTF',
					theater: 2,
				},
			],
		},
		{
			film: 'ip man',
			gender: 'action',
			page: 'https://www.ugc.fr/film.html?id=3&cinemaId=2',
			seances: [
				{
					hour: '08:15',
					version: 'VOSTF',
					theater: 2,
				},
				{
					hour: '10:20',
					version: 'VF',
					theater: 2,
				},
			],
		},
	]);
});

test('should return movies list', async () => {
	const movieListHtml = `
<div class="component--cinema-list-item">
	<button data-filmid="1" data-seancedate="something" data-seancehour="11:15" data-version="VOSTF" data-film="top gun" data-filmgender="action">
	<button data-filmid="1" data-seancedate="something else" data-seancehour="20:20" data-version="VF" data-film="top gun" data-filmgender="action">
</div>
<div class="component--cinema-list-item">
	<button data-filmid="2" data-seancedate="something else" data-seancehour="14:20" data-version="VOSTF" data-film="suzume" data-filmgender="anime">
</div>
	`;

	fetch.mockResolvedValue(createFetchResponse(movieListHtml));

	const cinemaId = 1;
	const movieList = await buildMovieList('2023-05-17', cinemaId);

	expect(movieList).not.toBe([]);

	const firstMovie = {
		film: 'top gun',
		gender: 'action',
		page: `https://www.ugc.fr/film.html?id=1&cinemaId=${cinemaId}`,
		seances: [
			{
				hour: '11:15',
				version: 'VOSTF',
				theater: 1,
			},
			{
				hour: '20:20',
				version: 'VF',
				theater: 1,
			},
		],
	};
	const secondMovie = {
		film: 'suzume',
		gender: 'anime',
		page: `https://www.ugc.fr/film.html?id=2&cinemaId=${cinemaId}`,
		seances: [
			{
				hour: '14:20',
				version: 'VOSTF',
				theater: 1,
			},
		],
	};

	expect(movieList[0]).toEqual(firstMovie);
	expect(movieList[1]).toEqual(secondMovie);
});

describe('test join movie lists', () => {
	test('should handle no common movies', () => {
		const lists = [
			[
				{
					film: 'top gun',
					gender: 'action',
					seances: [
						{
							hour: '11:15',
							version: 'VOSTF',
						},
					],
				},
			],
			[
				{
					film: 'suzume',
					gender: 'anime',
					seances: [
						{
							hour: '14:20',
							version: 'VOSTF',
						},
					],
				},
			],
		];

		const expectedList = [
			{
				film: 'top gun',
				gender: 'action',
				seances: [
					{
						hour: '11:15',
						version: 'VOSTF',
					},
				],
			},
			{
				film: 'suzume',
				gender: 'anime',
				seances: [
					{
						hour: '14:20',
						version: 'VOSTF',
					},
				],
			},
		];
		const result = mergeMovieLists(lists);
		expect(result).toEqual(expectedList);
	});

	test('shoud handle common movies', () => {
		const lists = [
			[
				{
					film: 'top gun',
					gender: 'action',
					seances: [
						{
							hour: '11:15',
							version: 'VOSTF',
						},
						{
							hour: '20:20',
							version: 'VF',
						},
					],
				},
				{
					film: 'suzume',
					gender: 'anime',
					seances: [
						{
							hour: '14:20',
							version: 'VOSTF',
						},
					],
				},
			],
			[
				{
					film: 'top gun',
					gender: 'action',
					seances: [
						{
							hour: '11:00',
							version: 'VOSTF',
						},
						{
							hour: '20:00',
							version: 'VF',
						},
					],
				},
				{
					film: 'ip man',
					gender: 'combat',
					seances: [
						{
							hour: '13:25',
							version: 'VF',
						},
					],
				},
			],
		];

		const expectedList = [
			{
				film: 'top gun',
				gender: 'action',
				seances: [
					{
						hour: '11:15',
						version: 'VOSTF',
					},
					{
						hour: '20:20',
						version: 'VF',
					},
					{
						hour: '11:00',
						version: 'VOSTF',
					},
					{
						hour: '20:00',
						version: 'VF',
					},
				],
			},
			{
				film: 'suzume',
				gender: 'anime',
				seances: [
					{
						hour: '14:20',
						version: 'VOSTF',
					},
				],
			},
			{
				film: 'ip man',
				gender: 'combat',
				seances: [
					{
						hour: '13:25',
						version: 'VF',
					},
				],
			},
		];

		const result = mergeMovieLists(lists);
		expect(result).toEqual(expectedList);
	});

	test('should merge more than two lists', () => {
		const lists = [
			[
				{
					film: 'top gun',
					gender: 'action',
					seances: [
						{
							hour: '11:15',
							version: 'VOSTF',
						},
						{
							hour: '20:20',
							version: 'VF',
						},
					],
				},
				{
					film: 'suzume',
					gender: 'anime',
					seances: [
						{
							hour: '14:20',
							version: 'VOSTF',
						},
					],
				},
			],
			[
				{
					film: 'top gun',
					gender: 'action',
					seances: [
						{
							hour: '11:00',
							version: 'VOSTF',
						},
						{
							hour: '20:00',
							version: 'VF',
						},
					],
				},
				{
					film: 'ip man',
					gender: 'combat',
					seances: [
						{
							hour: '13:25',
							version: 'VF',
						},
					],
				},
			],
			[
				{
					film: 'top gun',
					gender: 'action',
					seances: [
						{
							hour: '15:00',
							version: 'VOSTF',
						},
						{
							hour: '23:00',
							version: 'VF',
						},
					],
				},
				{
					film: 'ip man',
					gender: 'combat',
					seances: [
						{
							hour: '18:25',
							version: 'VF',
						},
					],
				},
			],
		];

		const expectedList = [
			{
				film: 'top gun',
				gender: 'action',
				seances: [
					{
						hour: '11:15',
						version: 'VOSTF',
					},
					{
						hour: '20:20',
						version: 'VF',
					},
					{
						hour: '11:00',
						version: 'VOSTF',
					},
					{
						hour: '20:00',
						version: 'VF',
					},
					{
						hour: '15:00',
						version: 'VOSTF',
					},
					{
						hour: '23:00',
						version: 'VF',
					},
				],
			},
			{
				film: 'suzume',
				gender: 'anime',
				seances: [
					{
						hour: '14:20',
						version: 'VOSTF',
					},
				],
			},
			{
				film: 'ip man',
				gender: 'combat',
				seances: [
					{
						hour: '13:25',
						version: 'VF',
					},
					{
						hour: '18:25',
						version: 'VF',
					},
				],
			},
		];

		const result = mergeMovieLists(lists);
		expect(result).toEqual(expectedList);

	});
});

describe('test start time fitlering', () => {
	const movies = [
		{
			film: 'top gun',
			gender: 'action',
			seances: [
				{
					hour: '11:15',
					version: 'VOSTF',
				},
				{
					hour: '20:20',
					version: 'VF',
				},
			],
		},
		{
			film: 'suzume',
			gender: 'anime',
			seances: [
				{
					hour: '14:20',
					version: 'VOSTF',
				},
			],
		},
	];

	test('should filter movies with start time', () => {
		let expectedMovies = [
			{
				film: 'top gun',
				gender: 'action',
				seances: [
					{
						hour: '20:20',
						version: 'VF',
					},
				],
			},
			{
				film: 'suzume',
				gender: 'anime',
				seances: [
					{
						hour: '14:20',
						version: 'VOSTF',
					},
				],
			},
		];

		let filteredMovies = filterStartTimeAfter(movies, '11:16');
		expect(filteredMovies).toEqual(expectedMovies);

		expectedMovies = [
			{
				film: 'top gun',
				gender: 'action',
				seances: [
					{
						hour: '20:20',
						version: 'VF',
					},
				],
			},
		];
		filteredMovies = filterStartTimeAfter(movies, '20:00');
		expect(filteredMovies).toEqual(expectedMovies);
	});

	test('should return all movies', () => {
		expect(filterStartTimeAfter(movies, '08:12')).toEqual(movies);
		expect(filterStartTimeAfter(movies, '10:21')).toEqual(movies);
		expect(filterStartTimeAfter(movies, '3:12')).toEqual(movies);
	});
});

test('should keep only VF', () => {
	const movies = [
		{
			film: 'top gun',
			gender: 'action',
			seances: [
				{
					hour: '11:15',
					version: 'VOSTF',
				},
				{
					hour: '20:20',
					version: 'VF',
				},
			],
		},
		{
			film: 'suzume',
			gender: 'anime',
			seances: [
				{
					hour: '14:20',
					version: 'VOSTF',
				},
			],
		},
	];

	const expectedMovies = [
		{
			film: 'top gun',
			gender: 'action',
			seances: [
				{
					hour: '20:20',
					version: 'VF',
				},
			],
		},
	];

	expect(filterLanguage(movies, 'VF')).toEqual(expectedMovies);
});

describe('test formatting', () => {
	const movies = [
		{
			film: 'top gun',
			gender: 'action',
			seances: [
				{
					hour: '11:15',
					version: 'VOSTF',
				},
				{
					hour: '20:20',
					version: 'VF',
				},
			],
		},
		{
			film: 'suzume',
			gender: 'anime',
			seances: [
				{
					hour: '14:20',
					version: 'VOSTF',
				},
			],
		},
	];

	const ensurePartsStartsWithTitle = (parts) => {
		parts.forEach(part => {
			expect(part.startsWith('**')).toBe(true);
		});
	};

	test('should format movie list', () => {
		const text = formatList(movies);
		expect(text).not.toEqual('');
		// expect text to start with a title
		expect(text.startsWith('**')).toBe(true);

		const titles = text.match(/\*\*.*\*\*/g);
		expect(titles).toHaveLength(2);

		const seances = text.match(/-\s\d*:\d*/g);
		expect(seances).toHaveLength(3);
	});

	test('should not need to split', () => {
		const text = formatList(movies);
		const maxLength = text.length;
		const splitted = splitFormattedList(text, maxLength);

		expect(splitted).toHaveLength(1);
		ensurePartsStartsWithTitle(splitted);
	});

	test('should split text in two parts', () => {
		const text = formatList(movies);
		const maxLength = text.length / 2;
		const splitted = splitFormattedList(text, maxLength);

		expect(splitted).toHaveLength(2);
		ensurePartsStartsWithTitle(splitted);
	});

	test('should split text in multiple parts', () => {
		const longMovieList = [];
		for (let i = 0; i < 30; i++) {
			longMovieList.push(
				{
					film: 'suzume',
					gender: 'anime',
					seances: [
						{
							hour: '14:20',
							version: 'VOSTF',
						},
					],
				},
			);
		}

		const text = formatList(longMovieList);
		const maxLength = 300;
		const splitted = splitFormattedList(text, maxLength);
		const expectedLength = Math.ceil(text.length / maxLength);

		expect(splitted).toHaveLength(expectedLength);
		ensurePartsStartsWithTitle(splitted);
	});
});

describe('test all seances in same theater', () => {
	test('should all be in same theater', () => {
		expect(isAllSameTheater([
			{ seances: [ { theater: 1 } ] },
			{ seances: [ { theater: 1 } ] },
			{ seances: [ { theater: 1 } ] },
		])).toEqual(true);
	});

	test('should not all be in same theater', () => {
		expect(isAllSameTheater([
			{ seances: [ { theater: 1 } ] },
			{ seances: [ { theater: 1 }, { theater: 2 } ] },
			{ seances: [ { theater: 1 } ] },
		])).toEqual(false);
	});

	test('should return true when empty', () => {
		expect(isAllSameTheater([])).toEqual(true);
	});
});
