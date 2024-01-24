import { createContext } from 'react';
import { MapSorting } from './Sorting';

type FiltersContextData = {
  favs: boolean;
  setFavs: (favs: boolean) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  search: string;
  setSearch: (search: string) => void;
  sorting: MapSorting;
  setSorting: (sorting: MapSorting) => void;
};

export const FiltersContext = createContext<FiltersContextData>(null);
