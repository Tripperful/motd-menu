import React, { FC, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import { FiltersContext } from './FiltersContext';

const useStyles = createUseStyles({
  root: {
    flex: '0 0 auto',
    display: 'flex',
  },
  searchInput: {
    transition: 'width 0.25s ease-out',
    width: '15em',
    '&:placeholder-shown:not(:focus)': {
      width: '8em',
    },
    flex: '1 1 auto',
    padding: '0.5em',
    marginRight: '0.5em',
  },
});

export const Search: FC = () => {
  const c = useStyles();

  const { search, setSearch } = useContext(FiltersContext);

  return (
    <div className={c.root}>
      <input
        type="text"
        placeholder="Search maps..."
        className={c.searchInput}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
    </div>
  );
};
