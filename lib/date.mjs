import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);

export const getTomorrowDate = () => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	return formatDate(tomorrow);
};

export const formatDate = (dateObject) => dayjs(dateObject).format('YYYY-MM-DD');

export const parseDayMonth = (text) => {
	const dayjsObject = dayjs(text, 'DD/MM', true);
	if (!dayjsObject.isValid()) throw new Error('invalid format');
	return dayjsObject.toDate();
};

export const fromDayMonth = (text) => formatDate(parseDayMonth(text));
