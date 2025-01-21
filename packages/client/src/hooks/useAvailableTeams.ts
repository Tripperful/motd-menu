import { useMemo } from 'react';
import { teamInfoByIdx } from 'src/util/teams';
import { useCvar } from './useCvar';

const dmTeams = [1, 0];
const tdmTeams = [1, 2, 3];
const mtdmTeams = [1, 8, 16, 24, 32, 40, 48];

export const useAvailableTeams = () => {
  const [teamplayValue] = useCvar('mp_teamplay');
  const [eqValue] = useCvar('mm_equalizer');

  const teams = useMemo(() => {
    if (!teamplayValue || !eqValue) {
      return [];
    }

    if (teamplayValue === '0') {
      return dmTeams;
    }

    if (eqValue === '2') {
      return mtdmTeams;
    }

    return tdmTeams;
  }, [teamplayValue, eqValue]);

  return useMemo(() => teams.map((idx) => teamInfoByIdx(idx)), [teams]);
};
