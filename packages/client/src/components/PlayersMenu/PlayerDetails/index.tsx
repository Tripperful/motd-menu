import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';
import { SidePanel } from '~components/common/SidePanel';

const useStyles = createUseStyles({
  root: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
});

const LazyPlayerDetailsContent = React.lazy(
  () => import(/* webpackChunkName: "lazy-main" */ './PlayerDetailsContent'),
);

export const PlayerDetails: FC<{ backPath?: string; steamId?: string }> = ({
  backPath,
  steamId,
}) => {
  const c = useStyles();
  const routeSteamId = useParams().steamId;
  steamId ??= routeSteamId;

  return (
    <SidePanel title={<h2>Player details</h2>} backPath={backPath}>
      <div className={c.root}>
        <LazyPlayerDetailsContent steamId={steamId} />
      </div>
    </SidePanel>
  );
};

export default PlayerDetails;
