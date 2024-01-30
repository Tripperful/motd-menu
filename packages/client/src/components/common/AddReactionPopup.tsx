import { ReactionName, allReactionNames } from '@motd-menu/common';
import React, { ComponentProps, FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import ArrowLeftIcon from '~icons/chevron-left.svg';
import ArrowRightIcon from '~icons/chevron-right.svg';
import { activeItem } from '~styles/elements';
import { Popup } from './Popup';
import { ReactionIcon } from './Reaction';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    gap: '0.5em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, min-content)',
    gridAutoFlow: 'row dense',
    width: '12em',
    height: '12em',
    gridAutoRows: 'auto',
    gap: '0.5em',
    '& > *': {
      ...activeItem(),
    },
  },
  pagerButton: {
    ...activeItem(),
    display: 'flex',
    alignItems: 'center',
    '&:first-child': {
      marginLeft: '-0.5em',
    },
    '&:last-child': {
      marginRight: '-0.5em',
    },
  },
});

const reactionsPageSize = 25; // 5x5 grid

export const AddReactionPopup: FC<
  Omit<ComponentProps<typeof Popup>, 'title' | 'children'> & {
    onReactionClick: (reaction: ReactionName) => void;
  }
> = ({ onReactionClick, ...props }) => {
  const c = useStyles();

  const [page, setPage] = useState(0);
  const pageStart = page * reactionsPageSize;
  const maxPage = Math.ceil(allReactionNames.length / reactionsPageSize) - 1;
  const hasPages = maxPage > 0;

  const curReactions = allReactionNames.slice(
    pageStart,
    pageStart + reactionsPageSize,
  );

  const onPrevPageClick = () => {
    if (page <= 0) return;
    setPage((c) => c - 1);
  };

  const onNextPageClick = () => {
    if (page >= maxPage) return;
    setPage((c) => c + 1);
  };

  return (
    <Popup title="Add reaction" {...props}>
      <div className={c.root}>
        {hasPages && (
          <div
            className={c.pagerButton}
            data-disabled={page <= 0}
            onClick={onPrevPageClick}
          >
            <ArrowLeftIcon />
          </div>
        )}
        <div className={c.grid}>
          {curReactions?.map((name) => (
            <ReactionIcon
              key={name}
              name={name}
              onClick={() => onReactionClick(name)}
            />
          ))}
        </div>
        {hasPages && (
          <div
            className={c.pagerButton}
            data-disabled={page >= maxPage}
            onClick={onNextPageClick}
          >
            <ArrowRightIcon />
          </div>
        )}
      </div>
    </Popup>
  );
};
