import range from 'lodash/range';
import React, {
  FC,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createUseStyles } from 'react-jss';
import { Link, useParams } from 'react-router-dom';
import { useMapsPreviews } from 'src/hooks/state/mapPreviews';
import { lsGet, lsSet } from 'src/util';
import { Page } from '~components/common/Page';
import ClearFiltersIcon from '~icons/filter-clear.svg';
import { activeItem, skeletonBg } from '~styles/elements';
import { theme } from '~styles/theme';
import { Filters } from './Filters';
import { FiltersContext } from './FiltersContext';
import { MapDetails } from './MapDetails';
import { MapTile } from './MapTile';
import { Search } from './Search';
import { MapSorting, mapComparators } from './Sorting';

const useStyles = createUseStyles({
  '@keyframes bgShift': {
    from: {
      backgroundPositionX: '0vw',
    },
    to: {
      backgroundPositionX: '100vw',
    },
  },
  list: {
    display: 'grid',
    position: 'relative',
    gridTemplateColumns: 'repeat(auto-fill, minmax(12em, 1fr))',
    alignContent: 'start',
    gap: '0.5em',
    flex: '1 1 auto',
    overflow: 'hidden scroll',
    padding: '0.5em',
  },
  notFound: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileSkeleton: {
    ...skeletonBg(),
    animation: '$bgShift 1s linear infinite',
    height: '10em',
    backgroundColor: theme.bg1,
    borderRadius: '1em',
  },
  clearFilters: {
    ...activeItem(),
    fontSize: '0.75em',
    padding: '0.5em',
    marginLeft: '-1.5em',
  },
});

const MapListContent: FC = () => {
  const c = useStyles();

  const maps = useMapsPreviews();
  const { search, favs, tags, sorting } = useContext(FiltersContext);

  const filteredSortedMaps = useMemo(
    () =>
      maps
        .filter((m) => {
          let show = true;

          show &&= !m.parentMap;

          if (search) {
            show &&= m.name.toLowerCase().includes(search.toLowerCase());
          }

          if (favs) {
            show &&= m.isFavorite;
          }

          if (tags?.length) {
            show &&= m.tags.some((tag) => tags.includes(tag));
          }

          return show;
        })
        .sort(
          (a, b) =>
            mapComparators[sorting.type](a, b) *
            (sorting.dir === 'asc' ? 1 : -1),
        ),
    [favs, maps, search, tags, sorting],
  );

  return filteredSortedMaps.length ? (
    filteredSortedMaps.map((preview) => (
      <Link key={preview.name} to={preview.name}>
        <MapTile preview={preview} />
      </Link>
    ))
  ) : (
    <div className={c.notFound}>
      <span>Couldn&apos;t find any maps!</span>
    </div>
  );
};

const MapListSkeleton: FC = () => {
  const c = useStyles();

  return (
    <>
      {range(10).map((i) => (
        <div key={i} className={c.tileSkeleton}></div>
      ))}
    </>
  );
};

export const MapList: FC = () => {
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState(() => lsGet('tagFilters'));
  const [favs, setFavs] = useState(() => lsGet('favsOnly'));
  const [sorting, setSorting] = useState(
    () => lsGet('mapSorting') ?? ({ type: 'name', dir: 'asc' } as MapSorting),
  );

  const clearFilters = useCallback(() => {
    setSearch('');
    setTags([]);
    setFavs(false);
  }, []);

  useEffect(() => {
    lsSet('favsOnly', favs);
  }, [favs]);

  useEffect(() => {
    lsSet('tagFilters', tags);
  }, [tags]);

  useEffect(() => {
    lsSet('mapSorting', sorting);
  }, [sorting]);

  const { mapName } = useParams();

  const c = useStyles();
  const hasFilters = Boolean(favs || search || tags?.length);

  return (
    <FiltersContext.Provider
      value={{
        favs,
        setFavs,
        search,
        setSearch,
        tags,
        setTags,
        sorting,
        setSorting,
      }}
    >
      <Page
        title="Maps"
        headerContent={
          <>
            <Filters />
            <Search />
            {hasFilters && (
              <div className={c.clearFilters} onClick={clearFilters}>
                <ClearFiltersIcon />
              </div>
            )}
          </>
        }
      >
        <div className={c.list}>
          <Suspense fallback={<MapListSkeleton />}>
            <MapListContent />
          </Suspense>
        </div>
        {mapName && <MapDetails mapName={mapName} />}
      </Page>
    </FiltersContext.Provider>
  );
};
