import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);

export const isValid = (text) => dayjs(text, 'HH:mm', true).isValid();
