export const base64encode = (str: string): string => {
  return Buffer.from(str).toString('base64');
};

export const base64decode = (str: string): string => {
  return Buffer.from(str, 'base64').toString();
};
