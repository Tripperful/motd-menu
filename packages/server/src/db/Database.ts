import {
  AmmoPickupData,
  BatteryPickupData,
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
  PlayerClientSettings,
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
} from '@motd-menu/common';
import { TelegramClientInfo } from 'src/telegram/types';
import { ChargeAggregate } from 'src/ws/servers/srcds/chargerUseHandler';
import { LogEventType } from './LogEventType';

export interface Database {
  init(): Promise<void>;
  logs: {
    add(
      eventType: LogEventType,
      steamId?: string,
      eventData?: unknown,
    ): Promise<void>;
  };
  maps: {
    init(mapNames: string[]): Promise<void>;
    get(steamId: string): Promise<MapPreviewData[]>;
    get(steamId: string, mapName: string): Promise<MapDetailsData>;
    setParent(mapName: string, parentMapName?: string): Promise<void>;
    setDescription(mapName: string, description?: string): Promise<void>;
    setImages(mapName: string, images: string[]): Promise<void>;
    setTags(mapName: string, tags: string[]): Promise<void>;
    deleteTag(tag: string): Promise<void>;
    setFavorite(
      mapName: string,
      steamId: string,
      favorite: boolean,
    ): Promise<void>;
    reactions: {
      get(mapName: string): Promise<ReactionData[]>;
      add(
        mapName: string,
        steamId: string,
        reaction: ReactionName,
      ): Promise<void>;
      delete(
        mapName: string,
        steamId: string,
        reaction: ReactionName,
      ): Promise<void>;
    };
    reviews: {
      get(mapName: string): Promise<MapReviewData[]>;
      getByAuthor(steamId: string): Promise<MapReviewData[]>;
      set(mapName: string, review: MapReviewData): Promise<string>;
      delete(mapName: string, authorSteamId: string): Promise<void>;
      reactions: {
        get(
          mapName: string,
          reviewAuthorSteamId: string,
        ): Promise<ReactionData[]>;
        add(
          mapName: string,
          reviewAuthorSteamId: string,
          steamId: string,
          reaction: ReactionName,
        ): Promise<void>;
        delete(
          mapName: string,
          reviewAuthorSteamId: string,
          steamId: string,
          reaction: ReactionName,
        ): Promise<void>;
      };
    };
  };
  permissions: {
    init(permissions: Permission[], rootAdmins: string[]): Promise<void>;
    get(userSteamId: string): Promise<Permission[]>;
    grant(userSteamId: string, permission: Permission): Promise<void>;
    withdraw(userSteamId: string, permission: Permission): Promise<void>;
  };
  client: {
    connected(
      token: string,
      steamId: string,
      serverId: number,
      ip: string,
      port: number,
      name: string,
    ): Promise<void>;
    disconnected(
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
    ): Promise<void>;
    addName(steamId: string, name: string): Promise<void>;
    getNames(steamId: string): Promise<string[]>;

    /**
     * Find all steam ids that have a name that matches the given name partially.
     * @param name The name to search for.
     * @returns An array of steam ids.
     */
    findByName(name: string): Promise<string[]>;
    getSmurfSteamIds(steamId: string): Promise<string[]>;
    getTotalTimePlayed(steamId: string, token: string): Promise<number>;
    setAka(steamId: string, name: string): Promise<void>;
    getAka(steamId: string): Promise<string>;
    settings: {
      get: (steamId: string) => Promise<PlayerClientSettings>;
      set: (steamId: string, settings: PlayerClientSettings) => Promise<void>;
    };
    saveCvars(steamId: string, cvars: Record<string, string>): Promise<void>;
    getLastSavedCvar(steamId: string, cvar: string): Promise<string>;
    getCustomRank(steamId: string): Promise<CustomRankData>;
    setCustomRank(steamId: string, rank: CustomRankData): Promise<void>;
    getCustomRankSubscription(steamId: string): Promise<number>;
    getLastIp(steamId: string): Promise<string>;
  };
  server: {
    getById(serverId: number): Promise<ServerInfo>;
    getByApiKey(apiKey: string): Promise<ServerInfo>;
    devTokenAuth(token: string): Promise<string>;
  };
  matchStats: {
    matchStarted(serverId: number, data: MatchStartedData): Promise<void>;
    matchEnded(data: MatchEndedData): Promise<void>;
    updateAfterMatchRanks(matchId: string, data: RankData[]): Promise<void>;
    playerDeath(data: PlayerDeathData): Promise<void>;
    playerRespawn(data: PlayerRespawnData): Promise<void>;
    playerDamage(data: PlayerDamageData): Promise<void>;
    playerAttack(data: PlayerAttackData): Promise<void>;
    itemRespawn(data: ItemRespawnData): Promise<void>;
    weaponDrop(data: WeaponDropData): Promise<void>;
    itemPickup(data: ItemPickupData): Promise<void>;
    medkitPickup(data: MedkitPickupData): Promise<void>;
    batteryPickup(data: BatteryPickupData): Promise<void>;
    ammoPickup(data: AmmoPickupData): Promise<void>;
    chargerUse(data: ChargeAggregate): Promise<void>;
    projectileSpawn(data: ProjectileSpawnData): Promise<void>;
    projectileDeath(data: ProjectileDeathData): Promise<void>;
    projectileBounce(data: ProjectileBounceData): Promise<void>;
    projectileOwnerChange(data: ProjectileOwnerChangeData): Promise<void>;
    projectileLifetimeReset(data: ProjectileLifetimeResetData): Promise<void>;
    entityTeleport(data: EntityTeleportData): Promise<void>;
    playerSubstitution(data: PlayerSubstitutionData): Promise<void>;
  };
  matches: {
    get(
      limit: number,
      offset: number,
      filters?: MatchFilters,
    ): Promise<PagedData<MatchSummary>>;
    get(matchId: string): Promise<MatchSummary>;
    getMatchDeaths(matchId: string): Promise<MatchDeathData[]>;
    getMatchDamage(matchId: string): Promise<MatchDamageData[]>;
    getMatchAccuracy(matchId: string): Promise<EfpsMatchSummaryStat[]>;
    getMiscPlayerStats(
      matchId: string,
      steamId: string,
    ): Promise<MiscPlayerMatchStats>;
    getEfpsStats(matchId: string): Promise<EfpsMatchSummary>;
    markSentToEfps(matchId: string): Promise<void>;
    getNotSentToEfps(): Promise<string[]>;
  };
  telegram: {
    linkClient(steamId: string, userId: number, chatId: number): Promise<void>;
    unlinkClient(steamId: string): Promise<void>;
    getAllClients(): Promise<TelegramClientInfo[]>;
    getClientBySteamId(steamId: string): Promise<TelegramClientInfo>;
    getClientByClientId(clientId: number): Promise<TelegramClientInfo>;
  };
  news: {
    getPreviews(
      steamId: string,
      limit: number,
      offset: number,
      searchText: string,
    ): Promise<NewsPreviewsPagedData>;
    getById(newsId: string, steamId: string): Promise<NewsData>;
    create(
      authorSteamId: string,
      title: string,
      content: string,
    ): Promise<string>;
    edit(newsId: string, title: string, content: string): Promise<void>;
    publish(newsId: string): Promise<void>;
    markRead(newsId: string, steamId: string): Promise<void>;
    markHidden(newsId: string, steamId: string): Promise<void>;
    delete(newsId: string): Promise<void>;
    comments: {
      get(newsId: string): Promise<NewsCommentData[]>;
      getById(commentId: string): Promise<NewsCommentData>;
      add(
        newsId: string,
        authorSteamId: string,
        content: string,
      ): Promise<string>;
      edit(commentId: string, content: string): Promise<void>;
      delete(commentId: string): Promise<void>;
      reactions: {
        get(commentId: string): Promise<ReactionData[]>;
        add(
          commentId: string,
          steamId: string,
          reaction: ReactionName,
        ): Promise<void>;
        delete(
          commentId: string,
          steamId: string,
          reaction: ReactionName,
        ): Promise<void>;
      };
    };
    reactions: {
      get(newsId: string): Promise<ReactionData[]>;
      add(
        newsId: string,
        steamId: string,
        reaction: ReactionName,
      ): Promise<void>;
      delete(
        newsId: string,
        steamId: string,
        reaction: ReactionName,
      ): Promise<void>;
    };
  };
}
