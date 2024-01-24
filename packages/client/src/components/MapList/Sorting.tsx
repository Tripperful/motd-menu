import { MapPreviewData, SortDirection } from '@motd-menu/common';
import React, { FC, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import { DropDown, DropDownOptionProps } from '~components/common/DropDown';
import ArrowDownIcon from '~icons/arrow-down-thin.svg';
import ArrowUpIcon from '~icons/arrow-up-thin.svg';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';
import { FiltersContext } from './FiltersContext';

export const mapSortingTitle = {
  name: 'Name',
  rating: 'Rating',
  numRates: 'Number of reviews',
};

export type MapSortingType = keyof typeof mapSortingTitle;

export interface MapSorting {
  type: MapSortingType;
  dir: SortDirection;
}

export const mapComparators: Record<
  MapSortingType,
  (a: MapPreviewData, b: MapPreviewData) => number
> = {
  name: (a: MapPreviewData, b: MapPreviewData) => {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  },
  rating: (a: MapPreviewData, b: MapPreviewData) => {
    return (a.rate ?? 0) - (b.rate ?? 0);
  },
  numRates: (a: MapPreviewData, b: MapPreviewData) => {
    return (a.numRates ?? 0) - (b.numRates ?? 0);
  },
};

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    gap: '0.25em',
    padding: '0.2em 0.4em 0.2em 0',
    border: `0.2em solid ${theme.fg3}`,
    borderRadius: '0.5em',
    fontSize: '0.75em',
    alignItems: 'center',
  },
  dirButton: {
    ...activeItem(),
    flex: '0 0 auto',
    fontSize: '0.75em',
  },
  curOption: {
    ...activeItem(),
  },
});

const mapSortingOptions = Object.entries(mapSortingTitle).map(
  ([value, title]) => ({ value, title }) as DropDownOptionProps<MapSortingType>,
);

export const Sorting: FC = () => {
  const c = useStyles();

  const { sorting, setSorting } = useContext(FiltersContext);

  const onDirClick = () => {
    setSorting({
      ...sorting,
      dir: sorting.dir === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className={c.root}>
      <div className={c.dirButton} onClick={onDirClick}>
        {sorting.dir === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </div>
      <DropDown
        options={mapSortingOptions}
        value={sorting.type}
        setValue={(type) =>
          setSorting({
            ...sorting,
            type,
          })
        }
      />
    </div>
  );
};
