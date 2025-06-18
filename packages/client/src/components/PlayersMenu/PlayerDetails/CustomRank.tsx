import {
  CustomRankData,
  hexToHsl,
  maxColorRankLength,
  maxGradientRankLength,
} from '@motd-menu/common';
import React, { FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useMySteamId } from 'src/hooks/useMySteamId';
import EditIcon from '~icons/pencil.svg';
import { activeItem, outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';
import {
  setPlayerStats,
  usePlayerStats,
} from '../../../hooks/state/playerStats';
import { ColoredText } from '../../common/ColoredText';
import { Popup } from '../../common/Popup';
import { TextColorer } from '../../common/TextColorer';
import { dateFormat } from 'src/util';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
  },
  editButton: {
    ...activeItem(),
    fontSize: '0.75em',
  },
  submitButton: {
    ...outlineButton(),
  },
  subscription: {
    color: theme.fg3,
  },
});

const noCustomRank = { title: 'None', colorStops: [hexToHsl(theme.fg3)] };
const defaultColorStops = [{ h: 140, s: 100, l: 50 }];

export const CustomRank: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const rankData = usePlayerStats(steamId);
  const mySteamId = useMySteamId();
  const canEditOthersRanks = useCheckPermission('custom_ranks_edit');
  const customRank = rankData?.customRank;
  const [editing, setEditing] = useState(false);

  const isSubscriptionActive =
    (rankData?.customRankExpiresOn ?? 0) > Date.now();
  const canEdit =
    (mySteamId === steamId || canEditOthersRanks) && isSubscriptionActive;

  const [title, setTitle] = useState(customRank?.title ?? 'Enter Rank');
  const [colorStops, setColorStops] = useState(
    customRank?.colorStops ?? defaultColorStops,
  );
  const maxTextLength =
    colorStops.length > 1 ? maxGradientRankLength : maxColorRankLength;

  const onSubmit = async () => {
    try {
      const customRank: CustomRankData = title ? { title, colorStops } : null;

      await motdApi.setPlayerCustomRank(steamId, customRank);
      await setPlayerStats(steamId, async (oldStats) => ({
        ...(await oldStats),
        customRank,
      }));

      addNotification('success', 'Custom rank updated');
    } catch {
      addNotification('error', 'Failed to update custom rank');
    }
    setEditing(false);
  };

  return (
    <div className={c.root}>
      <ColoredText
        text={customRank?.title ?? noCustomRank.title}
        colorStops={customRank?.colorStops ?? noCustomRank.colorStops}
      />
      <span className={c.subscription}>
        (
        {rankData?.customRankExpiresOn
          ? `expire${isSubscriptionActive ? 's' : 'd'} on ${dateFormat(rankData.customRankExpiresOn)}`
          : 'no subscription'}
        )
      </span>
      {canEdit && (
        <EditIcon className={c.editButton} onClick={() => setEditing(true)} />
      )}
      {editing ? (
        <Popup title="Edit your Custom Rank" onClose={() => setEditing(false)}>
          <TextColorer
            maxTextLength={maxTextLength}
            text={title}
            setText={setTitle}
            colorStops={colorStops}
            setColorStops={setColorStops}
          />
          <div className={c.submitButton} onClick={onSubmit}>
            Submit
          </div>
        </Popup>
      ) : null}
    </div>
  );
};
