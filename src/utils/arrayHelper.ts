export const checkForCommmonElements = (arr1: Array<any>, arr2: Array<any>): boolean => {
  return arr1.some((item) => arr2.includes(item));
};
