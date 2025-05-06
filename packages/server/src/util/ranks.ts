import {
  colorByRank,
  composeColoredText,
  RankData,
  RankUpdateData,
} from '@motd-menu/common';
import { db } from 'src/db';
import { EfpsClient } from './efps';

export const getRankData = async (steamId: string) => {
  const [customRank, customRankExpiresOn, efpsRank] = await Promise.all([
    db.client.getCustomRank(steamId),
    db.client
      .getCustomRankSubscription(steamId)
      .then((v) => (v ? Number(v) : null)),
    EfpsClient.getInstance()?.getRankData(steamId),
  ]);

  return { steamId, efpsRank, customRank, customRankExpiresOn } as RankData;
};

export const toSrcdsRankData = (data: RankData): RankUpdateData => {
  const { steamId, efpsRank, customRank } = data;

  const { r, g, b } = colorByRank(efpsRank?.title ?? 'iron');
  const pos = efpsRank?.pos ?? 0;
  const max = efpsRank?.max ?? 0;
  const points = efpsRank?.points ?? 0;

  const rank = customRank
    ? composeColoredText(customRank.title, customRank.colorStops)
    : efpsRank?.title;

  return { steamId, rank, points, pos, max, r, g, b };
};

