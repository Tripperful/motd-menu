import Color from 'color';
import { createUseStyles } from 'react-jss';
import { theme } from './theme';

export const useGlobalStyles = createUseStyles({
  '@global': {
    html: {
      fontSize: 'min(2vw, 20px)',
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 'bold',
      userSelect: 'none',
      color: theme.fg2,
    },
    body: {
      margin: 0,
      overflow: 'hidden',
      position: 'relative',
    },
    '#root': {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
    '#modalRoot, #overlayRoot': {
      display: 'contents',
    },
    dialog: {
      position: 'absolute',
      backgroundColor: 'transparent',
      margin: 0,
      padding: 0,
      maxWidth: 'unset',
      maxHeight: 'unset',
      border: 'none',
      outline: 'none',
      overflow: 'hidden',
      '&::backdrop': {
        backgroundColor: theme.bg2,
      },
    },
    a: {
      color: 'inherit',
      textDecoration: 'none',
      outline: 'none',
      '-webkit-user-drag': 'none',
    },
    'textarea, input[type=text]': {
      font: 'inherit',
      color: 'inherit',
      resize: 'none',
      border: 'none',
      outline: 'none',
      backgroundColor: theme.bg1,
      padding: '0.5em',
      borderRadius: '0.5em',
      '&:focus': {
        backgroundColor: Color(theme.bg1).mix(Color(theme.fg1), 0.1).hexa(),
      },
      '&::placeholder': {
        font: 'inherit',
        color: 'inherit',
        opacity: 0.7,
      },
    },
    iframe: {
      border: 'none',
      width: '100%',
      height: '100%',
    },
    '*': {
      boxSizing: 'border-box',

      '&::-webkit-scrollbar': {
        width: '0.5rem',
        height: '0.5rem',
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: theme.bg1,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: Color(theme.fg1).fade(0.2).hexa(),
        '&:hover': {
          backgroundColor: theme.fg1,
        },
        '&:active': {
          backgroundColor: Color(theme.fg1).saturate(0.5).hexa(),
        },
      },
      '&::-webkit-scrollbar-button': {
        display: 'none',
      },
    },
  },
});
