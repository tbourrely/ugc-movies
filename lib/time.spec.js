import { expect, test } from 'vitest';
import { isValid } from './time.mjs';

test.each([
	{ time: '12:33', expected: true },
	{ time: '32:33', expected: false },
	{ time: '2:3', expected: false },
	{ time: '2:32', expected: false },
	{ time: '17 32', expected: false },
])('isValid($time) -> $expected', ({ time, expected }) => {
	expect(isValid(time)).toBe(expected);
});

