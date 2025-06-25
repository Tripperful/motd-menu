import {
  AmmoPickupData,
  BatteryPickupData,
  ClientSettingsMetadataData,
  ClientSettingsValues,
  CustomRankData,
  EfpsMatchSummary,
  EfpsMatchSummaryStat,
  EntityTeleportData,
  ItemPickupData,
  ItemRespawnData,
  MapDetailsData,
  MapPreviewData,
  MapReviewData,
  MatchDamageData,
  MatchDeathData,
  MatchEndedData,
  MatchFilters,
  MatchStartedData,
  MatchSummary,
  MedkitPickupData,
  MiscPlayerMatchStats,
  NewsCommentData,
  NewsData,
  NewsPreviewsPagedData,
  PagedData,
  Permission,
  PlayerAttackData,
  PlayerDamageData,
  PlayerDeathData,
  PlayerRespawnData,
  PlayerSubstitutionData,
  ProjectileBounceData,
  ProjectileDeathData,
  ProjectileLifetimeResetData,
  ProjectileOwnerChangeData,
  ProjectileSpawnData,
  RankData,
  ReactionData,
  ReactionName,
  ServerInfo,
  WeaponDropData,
  allPermissions,
  allReactionNames,
} from '@motd-menu/common';
import { ChargeAggregate } from 'src/ws/servers/srcds/chargerUseHandler';
import { BasePgDatabase } from './BasePgDatabase';
import { Database } from './Database';
import { LogEventType } from './LogEventType';

export class PgDatabase extends BasePgDatabase implements Database {
  logs = {
    add: (eventType: LogEventType, steamId?: string, eventData?: unknown) =>
      this.call('add_log', eventType, steamId, eventData),
  };

  chat = {
    addMessage: (
      steamId: string,
      message: string,
      serverId: number,
      teamOnly: boolean,
      teamIdx: number,
      matchId: string | null,
    ) =>
      this.call(
        'add_chat_message',
        steamId,
        message,
        serverId,
        teamOnly,
        teamIdx,
        matchId,
      ),

    getPreferredLanguages: async (steamId: string) =>
      (await this.select<string[]>('get_player_languages', steamId)) ?? [],

    setPreferredLanguages: (steamId: string, languages: string[]) =>
      this.call('set_player_languages', steamId, languages),
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
    getLastIp: (steamId: string) =>
      this.select<string>('get_last_client_ip', steamId),

    settings: {
      getMetadata: async () =>
        this.select<ClientSettingsMetadataData>('get_client_settings_metadata'),

      upsertMetadata: async (settingsMetadata: ClientSettingsMetadataData) => {
        await this.call('upsert_client_settings_metadata', settingsMetadata);
      },

      getValues: async (steamId: string) =>
        (await this.select<ClientSettingsValues>(
          'get_client_settings_values',
          steamId,
        )) ?? {},

      setValues: async (steamId: string, values: ClientSettingsValues) => {
        await this.call('set_client_settings_values', steamId, values);
      },
    },

    saveCvars: (steamId: string, cvars: Record<string, string>) =>
      this.call('save_client_cvars', steamId, cvars),

    getLastSavedCvar: (steamId: string, cvar: string) =>
      this.select<string>('get_last_saved_cvar', steamId, cvar),

    getCustomRank: async (steamId: string) =>
      this.select<CustomRankData>('get_client_custom_rank', steamId),

    setCustomRank: async (steamId: string, rank: CustomRankData) => {
      await this.call('set_client_custom_rank', steamId, rank);
    },

    getCustomRankSubscription: async (steamId: string) =>
      this.select<number>('get_client_custom_rank_subscription', steamId),
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
    matchStarted: (serverId: number, data: MatchStartedData) =>
      this.call('match_started', serverId, data),
    matchEnded: (data: MatchEndedData) => this.call('match_ended', data),
    updateAfterMatchRanks: (matchId: string, data: RankData[]) =>
      this.call('set_aftermatch_ranks', matchId, data),
    playerDeath: (data: PlayerDeathData) => this.call('player_death', data),
    playerRespawn: (data: PlayerRespawnData) =>
      this.call('player_respawn', data),
    playerDamage: (data: PlayerDamageData) => this.call('player_damaged', data),
    playerAttack: (data: PlayerAttackData) => this.call('player_attack', data),
    itemRespawn: (data: ItemRespawnData) => this.call('item_respawn', data),
    weaponDrop: (data: WeaponDropData) => this.call('weapon_drop', data),
    itemPickup: (data: ItemPickupData) => this.call('item_pickup', data),
    medkitPickup: (data: MedkitPickupData) => this.call('medkit_pickup', data),
    batteryPickup: (data: BatteryPickupData) =>
      this.call('battery_pickup', data),
    ammoPickup: (data: AmmoPickupData) => this.call('ammo_pickup', data),
    chargerUse: (data: ChargeAggregate) => this.call('charger_use', data),
    projectileSpawn: (data: ProjectileSpawnData) =>
      this.call('projectile_spawn', data),
    projectileDeath: (data: ProjectileDeathData) =>
      this.call('projectile_death', data),
    projectileBounce: (data: ProjectileBounceData) =>
      this.call('projectile_bounce', data),
    projectileOwnerChange: (data: ProjectileOwnerChangeData) =>
      this.call('projectile_owner_change', data),
    projectileLifetimeReset: (data: ProjectileLifetimeResetData) =>
      this.call('projectile_lifetime_reset', data),
    entityTeleport: (data: EntityTeleportData) =>
      this.call('entity_teleport', data),
    playerSubstitution: (data: PlayerSubstitutionData) =>
      this.call('player_substitution', data),
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
    getMatchAccuracy: (matchId: string) =>
      this.select<EfpsMatchSummaryStat[]>('get_match_accuracy', matchId),
    getMiscPlayerStats: (matchId: string, steamId: string) =>
      this.select<MiscPlayerMatchStats>(
        'get_match_player_misc_stats',
        matchId,
        steamId,
      ),
    getEfpsStats: async (matchId: string) =>
      this.select<EfpsMatchSummary>('get_efps_stats', matchId),
    markSentToEfps: async (matchId: string) =>
      this.call('mark_sent_to_efps', matchId),
    getNotSentToEfps: async () => this.select<string[]>('get_not_sent_to_efps'),
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
    comments: {
      get: (newsId: string) =>
        this.select<NewsCommentData[]>('get_news_comments', newsId),
      getById: (commentId: string) =>
        this.select<NewsCommentData>('get_news_comment', commentId),
      add: (newsId: string, authorSteamId: string, content: string) =>
        this.select<string>(
          'create_news_comment',
          newsId,
          authorSteamId,
          content,
        ),
      edit: (commentId: string, content: string) =>
        this.call('edit_news_comment', commentId, content),
      delete: (commentId: string) =>
        this.call('delete_news_comment', commentId),
      reactions: {
        get: (commentId: string) =>
          this.select<ReactionData[]>('get_news_comment_reactions', commentId),
        add: (commentId: string, steamId: string, reaction: ReactionName) =>
          this.call('add_news_comment_reaction', commentId, steamId, reaction),
        delete: (commentId: string, steamId: string, reaction: ReactionName) =>
          this.call(
            'delete_news_comment_reaction',
            commentId,
            steamId,
            reaction,
          ),
      },
    },
    reactions: {
      get: (newsId: string) =>
        this.select<ReactionData[]>('get_news_reactions', newsId),
      add: (newsId: string, steamId: string, reaction: ReactionName) =>
        this.call('add_news_reaction', newsId, steamId, reaction),
      delete: (newsId: string, steamId: string, reaction: ReactionName) =>
        this.call('delete_news_reaction', newsId, steamId, reaction),
    },
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
