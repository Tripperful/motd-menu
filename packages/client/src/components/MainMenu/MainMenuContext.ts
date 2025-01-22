import { createContext, useContext } from 'react';
import { MenuItemInfo } from '~components/common/Menu';

interface MainMenuContextData {
  availableVotes: MenuItemInfo[];
  setAvailableVotes: (votes: MenuItemInfo[]) => void;
}

export const MainMenuContext = createContext({
  availableVotes: [],
  setAvailableVotes: () => {},
} as MainMenuContextData);

export const useMainMenuContext = () => {
  return useContext(MainMenuContext);
};
