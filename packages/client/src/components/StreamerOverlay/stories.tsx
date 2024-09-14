import type { Meta, StoryObj } from '@storybook/react';
import { StreamerOverlay } from '.';

const meta = {
  title: 'Example/StreamerOverlay',
  component: StreamerOverlay,
  argTypes: {
    name: { name: 'Name', control: 'text' },
    avatarUrl: { name: 'Avatar URL', control: 'text' },
    kills: { name: 'Kills', control: { type: 'range', min: 0, max: 200 } },
    deaths: { name: 'Deaths', control: { type: 'range', min: 0, max: 200 } },
    hp: { name: 'Health', control: { type: 'range', min: 0, max: 100 } },
    ap: { name: 'Armor', control: { type: 'range', min: 0, max: 200 } },
    sprint: { name: 'Sprint', control: { type: 'range', min: 0, max: 100 } },
    flashlight: { name: 'Flashlight', control: 'boolean' },
    weapon: { name: 'Weapon', control: 'text' },
  },
} satisfies Meta<typeof StreamerOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    name: 'Some Cool Player',
    avatarUrl:
      'https://i.imgur.com/wJViMrf.png',
    kills: 0,
    deaths: 0,
    hp: 75,
    ap: 100,
    sprint: 80,
    flashlight: true,
    weapon: '357',
  },
};
