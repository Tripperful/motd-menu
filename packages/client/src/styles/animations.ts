import { JssStyle } from 'jss';

const openStyles: JssStyle = {
  opacity: 1,
  transform: 'scale(1)',
};

const closedStyles: JssStyle = {
  opacity: 0,
  transform: 'scale(0)',
};

export const popin: JssStyle = {
  from: closedStyles,
  to: openStyles,
};

export const popout: JssStyle = {
  from: openStyles,
  to: closedStyles,
};
