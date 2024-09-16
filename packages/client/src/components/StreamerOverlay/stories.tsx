import type { Meta, StoryObj } from '@storybook/react';
import { PlayerOverlayItem } from './PlayerOverlayItem';

const meta = {
  title: 'Example/StreamerOverlay',
  component: PlayerOverlayItem,
  argTypes: {
    teamIdx: { name: 'Team Index', control: 'number' },
    name: { name: 'Name', control: 'text' },
    avatarUrl: { name: 'Avatar URL', control: 'text' },
    kills: { name: 'Kills', control: { type: 'range', min: 0, max: 200 } },
    deaths: { name: 'Deaths', control: { type: 'range', min: 0, max: 200 } },
    hp: { name: 'Health', control: { type: 'range', min: 0, max: 100 } },
    ap: { name: 'Armor', control: { type: 'range', min: 0, max: 200 } },
    sprint: { name: 'Sprint', control: { type: 'range', min: 0, max: 100 } },
    flashlight: { name: 'Flashlight', control: 'boolean' },
    weapon: {
      name: 'Weapon',
      control: {
        type: 'select',
      },
      options: [
        'weapon_crowbar',
        'weapon_stunstick',
        'weapon_physcannon',
        'weapon_pistol',
        'weapon_357',
        'weapon_smg1',
        'weapon_ar2',
        'weapon_shotgun',
        'weapon_crossbow',
        'weapon_frag',
        'weapon_slam',
        'weapon_rpg',
      ],
    },
  },
} satisfies Meta<typeof PlayerOverlayItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    teamIdx: 0,
    name: 'Some Cool Player',
    avatarUrl: 'https://i.imgur.com/wJViMrf.png',
    kills: 0,
    deaths: 0,
    hp: 75,
    ap: 100,
    sprint: 80,
    flashlight: true,
    weapon: 'weapon_crossbow',
  },
};
