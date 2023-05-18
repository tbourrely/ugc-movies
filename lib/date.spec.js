import { describe, expect, test, vi } from 'vitest';
import { formatDate, parseDayMonth } from './date.mjs';

// 25 juin 2023
const date = new Date(2023, 4, 25);
vi.useFakeTimers();
vi.setSystemTime(date);

test('should format date', () => {
	const formatted = formatDate(new Date());
	expect(formatted).toEqual('2023-05-25');
});

describe('parse day and month', () => {

	test('should read successfully', () => {
		const text = '31/12';
		const parsed = parseDayMonth(text);
		expect(parsed).toEqual(new Date(date.getFullYear(), 11, 31));
	});

	test('should read with error', () => {
		expect(() => parseDayMonth('31/13')).toThrowError();
		expect(() => parseDayMonth('00/00')).toThrowError();
	});
});
