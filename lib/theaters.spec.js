import { describe, expect, test, vi } from 'vitest';
import { getMovies, filterStartTimeAfter, formatList, splitFormattedList } from './theaters.mjs';

global.fetch = vi.fn();

function createFetchResponse(data) {
	return { text: () => new Promise((resolve) => resolve(data)) };
}

test('should return movies list', async () => {

	const movieListHtml = `
<div class="component--cinema-list-item">
	<button data-seancedate="something" data-seancehour="11:15" data-version="VOST" data-film="top gun" data-filmgender="action">
	<button data-seancedate="something else" data-seancehour="20:20" data-version="VF" data-film="top gun" data-filmgender="action">
</div>
<div class="component--cinema-list-item">
	<button data-seancedate="something else" data-seancehour="14:20" data-version="VOST" data-film="suzume" data-filmgender="anime">
</div>
	`;

	fetch.mockResolvedValue(createFetchResponse(movieListHtml));

	const movieList = await getMovies('2023-05-17', 1);

	expect(movieList).not.toBe([]);

	const firstMovie = {
		film: 'top gun',
		gender: 'action',
		seances: [
			{
				hour: '11:15',
				version: 'VOST',
			},
			{
				hour: '20:20',
				version: 'VF',
			},
		],
	};
	const secondMovie = {
		film: 'suzume',
		gender: 'anime',
		seances: [
			{
				hour: '14:20',
				version: 'VOST',
			},
		],
	};

	expect(movieList[0]).toEqual(firstMovie);
	expect(movieList[1]).toEqual(secondMovie);
});

describe('test start time fitlering', () => {
	const movies = [
		{
			film: 'top gun',
			gender: 'action',
			seances: [
				{
					hour: '11:15',
					version: 'VOST',
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
					version: 'VOST',
				},
			],
		},
	];

	test('should filter movies with start time', () => {
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
			{
				film: 'suzume',
				gender: 'anime',
				seances: [
					{
						hour: '14:20',
						version: 'VOST',
					},
				],
			},
		];

		const filteredMovies = filterStartTimeAfter(movies, '11:16');

		expect(filteredMovies).toEqual(expectedMovies);
	});

	test('should return all movies', () => {
		expect(filterStartTimeAfter(movies, '08:12')).toEqual(movies);
		expect(filterStartTimeAfter(movies, '10:21')).toEqual(movies);
		expect(filterStartTimeAfter(movies, '3:12')).toEqual(movies);
	});
});

describe('test formatting', () => {
	const movies = [
		{
			film: 'top gun',
			gender: 'action',
			seances: [
				{
					hour: '11:15',
					version: 'VOST',
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
					version: 'VOST',
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

		const seances = text.match(/\*\s\d*:\d*/g);
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
							version: 'VOST',
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
