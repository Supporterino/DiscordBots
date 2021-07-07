import { customAlphabet } from 'nanoid';

const fiveCharID = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);

/**
 * Generate a upper case five character ID
 * @returns the id as a string
 */
export const genID = (): string => {
  return fiveCharID();
};
