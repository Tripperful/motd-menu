import { JssStyle } from 'jss';
import { theme } from './theme';

export const activeItem: () => JssStyle = () => ({
  color: theme.fg1,
  cursor: 'pointer',
  userSelect: 'none',
  filter: 'drop-shadow(0rem 0rem 0rem transparent);',
  transform: 'scale(1)',
  transition: 'all 0.1s ease-out',
  '&:hover': {
    filter: 'drop-shadow(0 0 0.15rem #0008) saturate(2)',
    transform: 'scale(0.975)',
  },
  '&:active, &[data-active=true]': {
    filter: 'drop-shadow(0 0 0.1rem #000b) saturate(2) brightness(2)',
    transform: 'scale(0.95)',
  },
  '&:disabled, &[data-disabled=true]': {
    filter: 'grayscale(0.8)',
    pointerEvents: 'none',
  },
});

export const simpleButton: () => JssStyle = () => ({
  ...activeItem(),
  padding: '0.25em 1em',
  display: 'flex',
  gap: '0.25em',
  borderRadius: '0.5rem',
  alignItems: 'center',
  textAlign: 'center',
});

export const outlineButton: () => JssStyle = () => ({
  ...activeItem(),
  border: '0.2em solid currentColor',
  display: 'inline-flex',
  justifyContent: 'center',
  textAlign: 'center',
  alignItems: 'center',
  gap: '0.25em',
  padding: '0.2em 0.4em',
  borderRadius: '0.5em',
  '& > svg': {
    fontSize: '0.65em',
  },
});

export const fullscreen: () => JssStyle = () => ({
  position: 'fixed',
  width: '100vw',
  height: '100vh',
  left: 0,
  top: 0,
});

export const skeletonBg: () => JssStyle = () => ({
  backgroundImage: `linear-gradient(90deg, transparent, 10%, ${theme.bg1}, 20%, ${theme.bg1}, 30%, transparent, 70%, ${theme.bg1}, 80%, ${theme.bg1}, 90%, transparent)`,
  backgroundAttachment: 'fixed',
});
