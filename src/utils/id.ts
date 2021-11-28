import { customAlphabet } from 'nanoid';

const fiveCharID = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);
const hash = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 16);

/**
 * Generate a upper case five character ID
 * @returns the id as a string
 */
export const genID = (): string => {
  return fiveCharID();
};

/**
 * Generate a lowe case 16 character ID with digits
 * @returns the id as a string
 */
export const genHash = (): string => {
  return hash();
};
