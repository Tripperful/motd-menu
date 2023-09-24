import { JssStyle } from 'jss';

export const boxShadow: (size: number) => JssStyle = (size: number) => ({
  boxShadow: `0 0 ${size * 0.1}em black`,
});

export const filterShadow: (size: number) => JssStyle = (size: number) => ({
  filter: `drop-shadow(0 0 ${size * 0.1}em black)`,
});
