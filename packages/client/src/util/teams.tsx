import React from 'react';
import CombineIcon from '~icons/combine.svg';
import SpecIcon from '~icons/eye.svg';
import RebelIcon from '~icons/lambda.svg';

export interface PlayerTeam {
  readonly index: number;
  readonly joinIndex: number;
  readonly name: string;
  readonly icon: JSX.Element;
  readonly color: string;
}

const teamsInfo: PlayerTeam[] = [
  {
    index: 0,
    joinIndex: 2,
    name: 'Unassigned',
    color: '#ffb100',
    icon: <RebelIcon />,
  },
  {
    index: 1,
    joinIndex: 1,
    name: 'Spectator',
    color: '#ddd',
    icon: <SpecIcon />,
  },
  {
    index: 2,
    joinIndex: 2,
    name: 'Combine',
    color: '#8080ff',
    icon: <CombineIcon />,
  },
  {
    index: 3,
    joinIndex: 3,
    name: 'Rebel',
    color: '#ff8080',
    icon: <RebelIcon />,
  },
  {
    index: 8,
    joinIndex: 8,
    name: 'Red',
    color: '#ff3e3e',
    icon: <RebelIcon />,
  },
  {
    index: 16,
    joinIndex: 16,
    name: 'Blue',
    color: '#8080ff',
    icon: <RebelIcon />,
  },
  {
    index: 24,
    joinIndex: 24,
    name: 'Yellow',
    color: '#ffff00',
    icon: <RebelIcon />,
  },
  {
    index: 32,
    joinIndex: 32,
    name: 'Green',
    color: '#00ff00',
    icon: <RebelIcon />,
  },
  {
    index: 40,
    joinIndex: 40,
    name: 'Orange',
    color: '#ff8000',
    icon: <RebelIcon />,
  },
  {
    index: 48,
    joinIndex: 48,
    name: 'Purple',
    color: '#ff00ff',
    icon: <RebelIcon />,
  },
];

const teamInfoByIdxMap: readonly PlayerTeam[] = teamsInfo.reduce(
  (acc, team) => {
    acc[team.index] = team;
    return acc;
  },
  [],
);

export const teamInfoByIdx = (idx: number) =>
  teamInfoByIdxMap[idx] ?? teamsInfo[0];
