import {
  MapDetailsData,
  MapPreviewData,
  MapReviewData,
  Permission,
  allPermissions,
} from '@motd-menu/common';
import { config } from '~root/config';
import { BasePgDatabase } from './BasePgDatabase';
import { Database } from './Database';

export class PgDatabase extends BasePgDatabase implements Database {
  maps = {
    init: (mapNames: string[]) => this.call('maps_init', mapNames),
    get: ((steamId: string, mapName?: string) =>
      mapName
        ? this.select<MapDetailsData>('map_details', mapName, steamId)
        : this.select<MapPreviewData[]>(
            'maps_previews',
            steamId,
          )) as Database['maps']['get'],
    setDescription: (mapName: string, description?: string) =>
      this.call('map_set_description', mapName, description),
    setImages: (mapName: string, images: string[]) =>
      this.call('map_set_images', mapName, images),
    setTags: (mapName: string, tags: string[]) =>
      this.call('map_set_tags', mapName, tags),
    setFavorite: (mapName: string, steamId: string, favorite: boolean) =>
      this.call('map_set_favorite', mapName, steamId, favorite),
    reviews: {
      get: async (mapName: string) =>
        (await this.select<MapReviewData[]>('map_reviews', mapName)) ?? [],
      getByAuthor: async (steamId: string) =>
        (await this.select<MapReviewData[]>(
          'map_reviews_by_author',
          steamId,
        )) ?? [],
      set: (mapName: string, review: MapReviewData) =>
        this.select<string>('set_map_review', mapName, review),
      delete: (mapName: string, authorSteamId: string) =>
        this.call('delete_map_review', mapName, authorSteamId),
    },
  };
  permissions = {
    init: (permissions: Permission[], rootAdmins: string[]) =>
      this.call('permissions_init', permissions, rootAdmins),
    get: async (userSteamId: string) =>
      (await this.select<Permission[]>('user_permissions', userSteamId)) ?? [],
    grant: (userSteamId: string, permission: Permission) =>
      this.call('grant_permission', userSteamId, permission),
    withdraw: (userSteamId: string, permission: Permission) =>
      this.call('withdraw_permission', userSteamId, permission),
  };

  override async init() {
    await super.init();
    await this.call(
      'permissions_init',
      allPermissions,
      config.rootAdmins ?? [],
    );
  }
}
