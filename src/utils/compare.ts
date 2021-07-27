/**
 * Function to compare two functions ignoring case senstivity and whitespaces.
 * @param a String a to compare
 * @param b String b to compare
 * @return Boolean if the strings do match
 */
export const compTwoStringsInsensitive = (a: String, b: String) => {
  return stringSanitize(a) === stringSanitize(b);
};

/**
 * Function to make a string all upper case and remove whitespaces.
 * @param a String to sanitize
 * @return Modified string
 */
const stringSanitize = (a: String) => {
  return a.trim().toUpperCase().replace(/\s/g, '');
};
