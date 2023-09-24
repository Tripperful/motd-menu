import {
  MapDetailsData,
  MapPreviewData,
  MapReviewData,
  Permission,
} from '@motd-menu/common';

export interface Database {
  init(): Promise<void>;
  maps: {
    init(mapNames: string[]): Promise<void>;
    get(steamId: string): Promise<MapPreviewData[]>;
    get(steamId: string, mapName: string): Promise<MapDetailsData>;
    setDescription(mapName: string, description?: string): Promise<void>;
    setImages(mapName: string, images: string[]): Promise<void>;
    setTags(mapName: string, tags: string[]): Promise<void>;
    setFavorite(
      mapName: string,
      steamId: string,
      favorite: boolean,
    ): Promise<void>;
    reviews: {
      get(mapName: string): Promise<MapReviewData[]>;
      getByAuthor(steamId: string): Promise<MapReviewData[]>;
      set(mapName: string, review: MapReviewData): Promise<string>;
      delete(mapName: string, authorSteamId: string): Promise<void>;
    };
  };
  permissions: {
    init(permissions: Permission[], rootAdmins: string[]): Promise<void>;
    get(userSteamId: string): Promise<Permission[]>;
    grant(userSteamId: string, permission: Permission): Promise<void>;
    withdraw(userSteamId: string, permission: Permission): Promise<void>;
  };
}
