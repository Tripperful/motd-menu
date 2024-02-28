import {
  AmmoPickupMessage,
  BatteryPickupMessage,
  ItemPickupMessage,
  ItemRespawnMessage,
  MapDetailsData,
  MapPreviewData,
  MapReviewData,
  MatchEndedMessage,
  MatchStartedMessage,
  MatchSummary,
  MedkitPickupMessage,
  PagedData,
  Permission,
  PlayerAttackMessage,
  PlayerClientSettings,
  PlayerDamageMessage,
  PlayerDeathMessage,
  PlayerRespawnMessage,
  ReactionData,
  ReactionName,
  ServerInfo,
  WeaponDropMessage,
  allPermissions,
  allReactionNames,
} from '@motd-menu/common';
import { config } from '~root/config';
import { BasePgDatabase } from './BasePgDatabase';
import { Database } from './Database';

const defaultSettings: PlayerClientSettings = {
  fov: 90,
  drawViewmodel: true,
  esp: false,
  hitSound: true,
  killSound: true,
};

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
    setParent: (mapName: string, parentMapName?: string) =>
      this.call('map_set_parent', mapName, parentMapName),
    setDescription: (mapName: string, description?: string) =>
      this.call('map_set_description', mapName, description),
    setImages: (mapName: string, images: string[]) =>
      this.call('map_set_images', mapName, images),
    setTags: (mapName: string, tags: string[]) =>
      this.call('map_set_tags', mapName, tags),
    setFavorite: (mapName: string, steamId: string, favorite: boolean) =>
      this.call('map_set_favorite', mapName, steamId, favorite),
    reactions: {
      get: (mapName: string) =>
        this.select<ReactionData[]>('map_reactions', mapName),
      add: (mapName: string, steamId: string, reaction: ReactionName) =>
        this.call('add_map_reaction', mapName, steamId, reaction),
      delete: (mapName: string, steamId: string, reaction: ReactionName) =>
        this.call('delete_map_reaction', mapName, steamId, reaction),
    },
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
      reactions: {
        get: (mapName: string, reviewAuthorSteamId: string) =>
          this.select<ReactionData[]>(
            'map_review_reactions',
            mapName,
            reviewAuthorSteamId,
          ),
        add: (
          mapName: string,
          reviewAuthorSteamId: string,
          steamId: string,
          reaction: ReactionName,
        ) =>
          this.call(
            'add_map_review_reaction',
            mapName,
            reviewAuthorSteamId,
            steamId,
            reaction,
          ),
        delete: (
          mapName: string,
          reviewAuthorSteamId: string,
          steamId: string,
          reaction: ReactionName,
        ) =>
          this.call(
            'delete_map_review_reaction',
            mapName,
            reviewAuthorSteamId,
            steamId,
            reaction,
          ),
      },
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

  client = {
    connected: (
      token: string,
      steamId: string,
      ip: string,
      port: number,
      name: string,
    ) => this.call('client_connected', token, steamId, ip, port, name),
    disconnected: (
      token: string,
      inAvgLatency: number,
      inAvgLoss: number,
      inAvgChoke: number,
      inAvgPackets: number,
      inTotalData: number,
      outAvgLatency: number,
      outAvgLoss: number,
      outAvgChoke: number,
      outAvgPackets: number,
      outTotalData: number,
    ) =>
      this.call(
        'client_disconnected',
        token,
        inAvgLatency,
        inAvgLoss,
        inAvgChoke,
        inAvgPackets,
        inTotalData,
        outAvgLatency,
        outAvgLoss,
        outAvgChoke,
        outAvgPackets,
        outTotalData,
      ),
    addName: (steamId: string, name: string) =>
      this.call('client_add_name', steamId, name),
    getNames: (steamId: string) =>
      this.select<string[]>('client_get_names', steamId),
    getSmurfSteamIds: (steamId: string) =>
      this.select<string[]>('client_get_smurf_steam_ids', steamId),
    getTotalTimePlayed: (steamId: string, token: string) =>
      this.select<number>('client_get_time_played', steamId, token),
    setAka: async (steamId: string, name: string) => {
      if (name) {
        await this.call('client_set_aka', steamId, name);
      } else {
        await this.call('client_delete_aka', steamId);
      }
    },
    getAka: (steamId: string) => this.select<string>('client_get_aka', steamId),

    settings: {
      get: async (steamId: string) => {
        const storedSettings = await this.select<PlayerClientSettings>(
          'get_client_settings',
          steamId,
        );

        const settings: PlayerClientSettings = {
          ...defaultSettings,
          ...storedSettings,
        };

        return settings;
      },
      set: async (
        steamId: string,
        { hitSound, killSound, fov, esp, drawViewmodel }: PlayerClientSettings,
      ) => {
        const curSettings = await this.client.settings.get(steamId);

        this.call(
          'set_client_settings',
          steamId,
          hitSound ?? curSettings.hitSound,
          killSound ?? curSettings.killSound,
          fov ?? curSettings.fov,
          esp ?? curSettings.esp,
          drawViewmodel ?? curSettings.drawViewmodel,
        );
      },
    },
  };

  server = {
    getByApiKey: (apiKey: string) =>
      this.select<ServerInfo>('server_by_key', apiKey),
  };

  matchStats = {
    matchStarted: (serverId: number, data: MatchStartedMessage) =>
      this.call('match_started', serverId, data),
    matchEnded: (data: MatchEndedMessage) => this.call('match_ended', data),
    playerDeath: (data: PlayerDeathMessage) => this.call('player_death', data),
    playerRespawn: (data: PlayerRespawnMessage) =>
      this.call('player_respawn', data),
    playerDamage: (data: PlayerDamageMessage) =>
      this.call('player_damaged', data),
    playerAttack: (data: PlayerAttackMessage) =>
      this.call('player_attack', data),
    itemRespawn: (data: ItemRespawnMessage) => this.call('item_respawn', data),
    weaponDrop: (data: WeaponDropMessage) => this.call('weapon_drop', data),
    itemPickup: (data: ItemPickupMessage) => this.call('item_pickup', data),
    medkitPickup: (data: MedkitPickupMessage) =>
      this.call('medkit_pickup', data),
    batteryPickup: (data: BatteryPickupMessage) =>
      this.call('battery_pickup', data),
    ammoPickup: (data: AmmoPickupMessage) => this.call('ammo_pickup', data),
  };

  matches = {
    get: async (limit: number, offset: number) =>
      (await this.select<PagedData<MatchSummary>>(
        'get_matches',
        limit,
        offset,
      )) ?? { data: [], total: 0 },
  };

  override async init() {
    await super.init();
    await Promise.allSettled([
      this.call('permissions_init', allPermissions, config.rootAdmins ?? []),
      this.call('reactions_init', allReactionNames),
    ]);
  }
}
