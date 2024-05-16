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
  ReactionData,
  ReactionName,
  ServerInfo,
  WeaponDropMessage,
} from '@motd-menu/common';
import { ChargeAggregate } from 'src/ws/chargerUseHandler';
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
  };
  server: {
    getById(serverId: number): Promise<ServerInfo>;
    getByApiKey(apiKey: string): Promise<ServerInfo>;
    devTokenAuth(token: string): Promise<string>;
  };
  matchStats: {
    matchStarted(serverId: number, data: MatchStartedMessage): Promise<void>;
    matchEnded(data: MatchEndedMessage): Promise<void>;
    playerDeath(data: PlayerDeathMessage): Promise<void>;
    playerRespawn(data: PlayerRespawnMessage): Promise<void>;
    playerDamage(data: PlayerDamageMessage): Promise<void>;
    playerAttack(data: PlayerAttackMessage): Promise<void>;
    itemRespawn(data: ItemRespawnMessage): Promise<void>;
    weaponDrop(data: WeaponDropMessage): Promise<void>;
    itemPickup(data: ItemPickupMessage): Promise<void>;
    medkitPickup(data: MedkitPickupMessage): Promise<void>;
    batteryPickup(data: BatteryPickupMessage): Promise<void>;
    ammoPickup(data: AmmoPickupMessage): Promise<void>;
    chargerUse(data: ChargeAggregate): Promise<void>;
    projectileSpawn(data: ProjectileSpawnMessage): Promise<void>;
    projectileDeath(data: ProjectileDeathMessage): Promise<void>;
    projectileBounce(data: ProjectileBounceMessage): Promise<void>;
    projectileOwnerChange(data: ProjectileOwnerChangeMessage): Promise<void>;
    projectileLifetimeReset(
      data: ProjectileLifetimeResetMessage,
    ): Promise<void>;
    entityTeleport(data: EntityTeleportMessage): Promise<void>;
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
    getEfpsStats(matchId: string): Promise<EfpsMatchSummary>;
    markSentToEfps(matchId: string): Promise<void>;
    getNotSentToEfps(): Promise<string[]>;
  };
}
