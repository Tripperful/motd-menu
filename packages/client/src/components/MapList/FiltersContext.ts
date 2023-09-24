import { createContext } from 'react';

type FiltersContextData = {
  favs: boolean;
  setFavs: (favs: boolean) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  search: string;
  setSearch: (search: string) => void;
};

export const FiltersContext = createContext<FiltersContextData>(null);
