import {
  AmmoPickupMessage,
  BatteryPickupMessage,
  EfpsMatchSummary,
  EntityTeleportMessage,
  ItemPickupMessage,
  ItemRespawnMessage,
  MapDetailsData,
  MapPreviewData,
  MapReviewData,
  MatchDamageData,
  MatchDeathData,
  MatchEndedMessage,
  MatchFilters,
  MatchStartedMessage,
  MatchSummary,
  MedkitPickupMessage,
  NewsData,
  NewsPreviewsPagedData,
  PagedData,
  Permission,
  PlayerAttackMessage,
  PlayerClientSettings,
  PlayerDamageMessage,
  PlayerDeathMessage,
  PlayerRespawnMessage,
  ProjectileBounceMessage,
  ProjectileDeathMessage,
  ProjectileLifetimeResetMessage,
  ProjectileOwnerChangeMessage,
  ProjectileSpawnMessage,
  RankUpdateData,
  ReactionData,
  ReactionName,
  ServerInfo,
  WeaponDropMessage,
  allPermissions,
  allReactionNames,
} from '@motd-menu/common';
import { TelegramClientInfo } from 'src/telegram/types';
import { ChargeAggregate } from 'src/ws/chargerUseHandler';
import { BasePgDatabase } from './BasePgDatabase';
import { Database } from './Database';
import { LogEventType } from './LogEventType';

const defaultSettings: PlayerClientSettings = {
  fov: 90,
  magnumZoomFov: 0,
  crossbowZoomFov: 20,
  drawViewmodel: true,
  esp: false,
  dsp: true,
  hitSound: true,
  killSound: true,
  kevlarSound: true,
};

export class PgDatabase extends BasePgDatabase implements Database {
  logs = {
    add: (eventType: LogEventType, steamId?: string, eventData?: unknown) =>
      this.call('add_log', eventType, steamId, eventData),
  };

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
    deleteTag: (tag: string) => this.call('delete_maps_tag', tag),
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
      serverId: number,
      ip: string,
      port: number,
      name: string,
    ) =>
      this.call('client_connected', token, steamId, serverId, ip, port, name),
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
    findByName: (name: string) =>
      this.select<string[]>('client_find_by_name', name),
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
        {
          hitSound,
          killSound,
          kevlarSound,
          fov,
          magnumZoomFov,
          crossbowZoomFov,
          esp,
          dsp,
          drawViewmodel,
        }: PlayerClientSettings,
      ) => {
        const curSettings = await this.client.settings.get(steamId);

        this.call(
          'set_client_settings',
          steamId,
          hitSound ?? curSettings.hitSound,
          killSound ?? curSettings.killSound,
          kevlarSound ?? curSettings.kevlarSound,
          fov ?? curSettings.fov,
          magnumZoomFov ?? curSettings.magnumZoomFov,
          crossbowZoomFov ?? curSettings.crossbowZoomFov,
          esp ?? curSettings.esp,
          dsp ?? curSettings.dsp,
          drawViewmodel ?? curSettings.drawViewmodel,
        );
      },
    },

    saveCvars: (steamId: string, cvars: Record<string, string>) =>
      this.call('save_client_cvars', steamId, cvars),
  };

  server = {
    getById: (serverId: number) =>
      this.select<ServerInfo>('server_by_id', serverId),
    getByApiKey: (apiKey: string) =>
      this.select<ServerInfo>('server_by_key', apiKey),
    devTokenAuth: (token: string) =>
      this.select<string>('dev_token_steam_id', token),
  };

  matchStats = {
    matchStarted: (serverId: number, data: MatchStartedMessage) =>
      this.call('match_started', serverId, data),
    matchEnded: (data: MatchEndedMessage) => this.call('match_ended', data),
    updateAfterMatchRanks: (matchId: string, data: RankUpdateData[]) =>
      this.call('set_aftermatch_ranks', matchId, data),
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
    chargerUse: (data: ChargeAggregate) => this.call('charger_use', data),
    projectileSpawn: (data: ProjectileSpawnMessage) =>
      this.call('projectile_spawn', data),
    projectileDeath: (data: ProjectileDeathMessage) =>
      this.call('projectile_death', data),
    projectileBounce: (data: ProjectileBounceMessage) =>
      this.call('projectile_bounce', data),
    projectileOwnerChange: (data: ProjectileOwnerChangeMessage) =>
      this.call('projectile_owner_change', data),
    projectileLifetimeReset: (data: ProjectileLifetimeResetMessage) =>
      this.call('projectile_lifetime_reset', data),
    entityTeleport: (data: EntityTeleportMessage) =>
      this.call('entity_teleport', data),
  };

  matches = {
    get: (async (
      limitOrId: number | string,
      offset?: number,
      filters?: MatchFilters,
    ) =>
      typeof limitOrId === 'string'
        ? await this.select<MatchSummary>('get_match', limitOrId)
        : ((await this.select<PagedData<MatchSummary>>(
            'get_matches',
            filters?.mapName,
            filters?.players,
            filters?.serverName,
            filters?.matchStatuses,
            limitOrId,
            offset,
          )) ?? { data: [], total: 0 })) as Database['matches']['get'],
    getMatchDeaths: (matchId: string) =>
      this.select<MatchDeathData[]>('get_match_deaths', matchId),
    getMatchDamage: (matchId: string) =>
      this.select<MatchDamageData[]>('get_match_damage', matchId),
    getEfpsStats: async (matchId: string) =>
      this.select<EfpsMatchSummary>('get_efps_stats', matchId),
    markSentToEfps: async (matchId: string) =>
      this.call('mark_sent_to_efps', matchId),
    getNotSentToEfps: async () => this.select<string[]>('get_not_sent_to_efps'),
  };

  telegram = {
    linkClient: (steamId: string, userId: number, chatId: number) =>
      this.call('tg_link_client', steamId, userId, chatId),
    unlinkClient: (steamId: string) => this.call('tg_unlink_client', steamId),
    getClientBySteamId: (steamId: string) =>
      this.select<TelegramClientInfo>('tg_get_client_by_steam_id', steamId),
    getAllClients: () =>
      this.select<TelegramClientInfo[]>('tg_get_all_clients'),
    getClientByClientId: (clientId: number) =>
      this.select<TelegramClientInfo>('tg_get_client_by_client_id', clientId),
  };

  news = {
    getPreviews: (
      steamId: string,
      limit: number,
      offset: number,
      searchText: string,
    ) =>
      this.select<NewsPreviewsPagedData>(
        'get_player_news_previews',
        steamId,
        limit,
        offset,
        searchText,
      ),
    getById: (newsId: string, steamId: string) =>
      this.select<NewsData>('get_news_by_id', newsId, steamId),
    create: (authorSteamId: string, title: string, content: string) =>
      this.select<string>('create_news', authorSteamId, title, content),
    edit: (newsId: string, title: string, content: string) =>
      this.call('edit_news', newsId, title, content),
    publish: (newsId: string) => this.call('publish_news', newsId),
    markRead: (newsId: string, steamId: string) =>
      this.call('mark_news_read', newsId, steamId),
    markHidden: (newsId: string, steamId: string) =>
      this.call('mark_news_hidden', newsId, steamId),
    delete: (newsId: string) => this.call('delete_news', newsId),
  };

  override async init() {
    await super.init();
    await Promise.allSettled([
      this.call(
        'permissions_init',
        allPermissions,
        process.env.MOTD_ROOT_ADMINS?.split(',')?.map((v) => v.trim()) ?? [],
      ),
      this.call('reactions_init', allReactionNames),
    ]);
  }
}
