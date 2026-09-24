/** A mobile number of 9 to 12 digits, e.g. 0722111222. */
export const PHONE_PATTERN = /^[0-9]{9,12}$/;

/** At least one non-whitespace character, so "   " doesn't pass as a filled-in field. */
export const NOT_BLANK = /\S/;
