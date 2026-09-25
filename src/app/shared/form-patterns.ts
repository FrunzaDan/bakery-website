/** A phone number of 9 to 12 digits, optionally with a leading + and spaces, dots or dashes between them, e.g. 0722 111 222. */
export const PHONE_PATTERN = /^\+?[0-9](?:[ .-]?[0-9]){8,11}$/;

/** At least one non-whitespace character, so "   " doesn't pass as a filled-in field. */
export const NOT_BLANK = /\S/;
