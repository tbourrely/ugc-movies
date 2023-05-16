import { describe, expect, test, vi } from 'vitest';
import { getMovies, filterStartTimeAfter } from './theaters.mjs';

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
