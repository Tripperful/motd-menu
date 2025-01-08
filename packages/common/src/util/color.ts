import { HslColor, RgbColor } from '../types/color';

const contrastingColors = [
  '#FFFF00',
  '#1CE6FF',
  '#FF34FF',
  '#FF4A46',
  '#008941',
  '#006FA6',
  '#A30059',
  '#FFDBE5',
  '#7A4900',
  '#0000A6',
  '#63FFAC',
  '#B79762',
  '#004D43',
  '#8FB0FF',
  '#997D87',
  '#5A0007',
  '#809693',
  '#FEFFE6',
  '#1B4400',
  '#4FC601',
  '#3B5DFF',
  '#4A3B53',
  '#FF2F80',
  '#61615A',
  '#BA0900',
  '#6B7900',
  '#00C2A0',
  '#FFAA92',
  '#FF90C9',
  '#B903AA',
  '#D16100',
  '#DDEFFF',
];

export const getContrastingColor = (idx: number) =>
  contrastingColors[idx % contrastingColors.length];
const hueToRgb = (p: number, q: number, t: number): number => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

  return p;
};

export const rgbToHex = (rgb: RgbColor): string =>
  `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g
    .toString(16)
    .padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;

export const hexToRgb = (hex: string): RgbColor => {
  hex = hex.replace(/^#/, '').toLowerCase();
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

export const hexToHsl = (hex: string): HslColor => rgbToHsl(hexToRgb(hex));

export const hslToRgb = (hsl: HslColor): RgbColor => {
  const { h, s, l } = hsl;

  const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

  const lNorm = clamp(l, 0, 100) / 100;
  const sNorm = clamp(s, 0, 100) / 100;
  const hNorm = (((h % 360) + 360) % 360) / 360;

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const r = hueToRgb(p, q, hNorm + 1 / 3);
  const g = hueToRgb(p, q, hNorm);
  const b = hueToRgb(p, q, hNorm - 1 / 3);

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const rgbToHsl = (rgb: RgbColor): HslColor => {
  const { r, g, b } = rgb;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = l < 0.5 ? delta / (max + min) : delta / (2 - max - min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / delta + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / delta + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const lerp = (start: number, end: number, factor: number): number =>
  start + (end - start) * factor;

export const sampleGradient = (
  colorStops: HslColor[],
  position: number,
): HslColor => {
  if (colorStops.length === 0) {
    throw new Error('colorStops array cannot be empty');
  }

  if (colorStops.length === 1) {
    return colorStops[0];
  }

  const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);
  const pos = clamp(position, 0, 1);

  const scaledPosition = pos * (colorStops.length - 1);
  const leftIndex = Math.floor(scaledPosition);
  const rightIndex = Math.ceil(scaledPosition);

  if (leftIndex === rightIndex) {
    return colorStops[leftIndex];
  }

  const t = scaledPosition - leftIndex;

  const leftRgb = hslToRgb(colorStops[leftIndex]);
  const rightRgb = hslToRgb(colorStops[rightIndex]);

  const interpolatedRgb: RgbColor = {
    r: Math.round(lerp(leftRgb.r, rightRgb.r, t)),
    g: Math.round(lerp(leftRgb.g, rightRgb.g, t)),
    b: Math.round(lerp(leftRgb.b, rightRgb.b, t)),
  };

  const interpolatedHsl = rgbToHsl(interpolatedRgb);

  const deltaH = Math.abs(colorStops[rightIndex].h - colorStops[leftIndex].h);

  if (deltaH > 180) {
    if (colorStops[rightIndex].h > colorStops[leftIndex].h) {
      interpolatedHsl.h = (interpolatedHsl.h - 360) % 360;
    } else {
      interpolatedHsl.h = (interpolatedHsl.h + 360) % 360;
    }
  }

  return interpolatedHsl;
};

type ChatColorFunc = {
  (hexrgb: string): string;
  MOTD: string;
  Yellow: string;
  Info: string;
  Value: string;
  Allow: string;
  Warning: string;
  White: string;
};

export const chatColor: ChatColorFunc = (hexrgb: string) => `\x07${hexrgb}`;

chatColor.MOTD = chatColor('EFF542');
chatColor.Yellow = chatColor('FFB200');
chatColor.Info = chatColor('387cd3');
chatColor.Value = chatColor('99CCFF');
chatColor.Allow = chatColor('40FF40');
chatColor.Warning = chatColor('FF4040');
chatColor.White = chatColor('FFFFFF');

export const chatColorRgb = (rgb: RgbColor) =>
  chatColor(rgbToHex(rgb).slice(1).toUpperCase());

export const chatColorHsl = (hsl: HslColor) => chatColorRgb(hslToRgb(hsl));

export const composeColoredText = (
  cleanText: string,
  colorStops: HslColor[],
) =>
  colorStops.length > 1
    ? cleanText
        .split('')
        .map(
          (c, i) =>
            chatColorHsl(
              sampleGradient(colorStops, i / (cleanText.length - 1)),
            ) + c,
        )
        .join('')
    : chatColorHsl(colorStops[0]) + cleanText;

export const decomposeColoredText = (text: string) => {
  let cleanText = '';
  const colorStops: HslColor[] = [];

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\x07') {
      const hex = text.slice(i + 1, i + 7);
      colorStops.push(hexToHsl(hex));
      i += 6;
    } else {
      cleanText += text[i];
    }
  }

  return { cleanText, colorStops };
};

export const colorByRank = (rank: string): RgbColor => {
  rank = rank.toLowerCase();

  if (rank.includes('iron')) return { r: 125, g: 43, b: 0 };
  if (rank.includes('bronze')) return { r: 187, g: 119, b: 62 };
  if (rank.includes('silver')) return { r: 167, g: 167, b: 167 };
  if (rank.includes('gold')) return { r: 238, g: 175, b: 55 };
  if (rank.includes('platinum')) return { r: 50, g: 204, b: 179 };
  if (rank.includes('cobalt')) return { r: 0, g: 124, b: 251 };
  if (rank.includes('pro')) return { r: 200, g: 14, b: 14 };

  return { r: 255, g: 255, b: 255 };
};
