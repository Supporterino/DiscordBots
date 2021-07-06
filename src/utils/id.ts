import { customAlphabet } from 'nanoid';

const fiveCharID = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);

export const genID = (): string => {
  return fiveCharID();
};
