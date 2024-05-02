import {
  ArrayElementType,
  Cvar,
  MapDetailsData,
  MapPreviewData,
  MapReviewData,
  MatchDamageData,
  MatchDeathData,
  MatchSummary,
  OnlinePlayerInfo,
  PagedData,
  Permission,
  PlayerClientSettings,
  ReactionData,
  ReactionName,
  Severity,
  StartMatchSettings,
  SteamPlayerData,
} from '@motd-menu/common';

class MotdApi {
  private requestCache: Record<string, Promise<string>> = {};

  protected async query(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    body?: string,
  ): Promise<string> {
    const url = new URL(
      `${location.protocol}//${location.host}/api/${endpoint}`,
    );

    const cacheKey = method + url + (body ?? '');

    const cachedRequest = this.requestCache[cacheKey];

    if (cachedRequest) return cachedRequest;

    const resPromise = fetch(url, {
      method,
      body,
      headers: body
        ? {
            'Content-Type': 'application/json',
          }
        : undefined,
    }).then(async (res) => {
      const text = await res.text();

      if (res.ok) {
        return text;
      }

      throw text;
    });

    this.requestCache[cacheKey] = resPromise;

    const result = await resPromise;

    delete this.requestCache[cacheKey];

    return result;
  }

  protected async get(endpoint: string, body?: string): Promise<string> {
    return this.query('GET', endpoint, body);
  }

  protected async post(endpoint: string, body?: string): Promise<string> {
    return this.query('POST', endpoint, body);
  }

  protected async delete(endpoint: string, body?: string): Promise<string> {
    return this.query('DELETE', endpoint, body);
  }

  public async sendLog(severity: Severity, log: string) {
    await this.post('log/' + severity, log);
  }

  public async closeMenu() {
    await this.post('menu/close');
  }

  public async getOnlinePlayers() {
    const res = await this.get('players');

    return JSON.parse(res) as OnlinePlayerInfo[];
  }

  public async getTotalTimePlayed(steamId: string) {
    return Number(await this.get('players/timeplayed/' + steamId));
  }

  public async getPlayerNames(steamId: string) {
    const res = await this.get('players/names/' + steamId);

    return JSON.parse(res) as string[];
  }

  public async findPlayersByName(name: string) {
    const res = await this.get('players/findByName/' + name);

    return JSON.parse(res) as SteamPlayerData[];
  }

  public async getPlayerSmurfSteamIds(steamId: string) {
    const res = await this.get('players/smurfs/' + steamId);

    return JSON.parse(res) as string[];
  }

  public async getPlayerSteamProfile(steamId: string) {
    const res = await this.get('players/' + steamId);

    return JSON.parse(res) as SteamPlayerData;
  }

  public async getPlayerPermissions(steamId: string) {
    const res = await this.get('players/permissions/' + steamId);

    return JSON.parse(res) as Permission[];
  }

  public async grantPlayerPermission(steamId: string, permission: Permission) {
    await this.post(`players/permissions/${steamId}/grant/${permission}`);
  }

  public async withdrawPlayerPermission(
    steamId: string,
    permission: Permission,
  ) {
    await this.post(`players/permissions/${steamId}/withdraw/${permission}`);
  }

  public async setTeam(teamIndex: number, userId?: number) {
    await this.post('teams/set/' + (userId ? userId + '/' : '') + teamIndex);
  }

  public async setPlayerAka(steamId: string, name: string) {
    if (name) {
      await this.post(`players/aka/${steamId}/${name}`);
    } else {
      await this.delete(`players/aka/${steamId}`);
    }
  }

  public async getPlayerAka(steamId: string) {
    return (await this.get(`players/aka/${steamId}`)) || null;
  }

  public async getPlayerSettings(steamId: string) {
    return JSON.parse(
      await this.get(`players/settings/${steamId}`),
    ) as PlayerClientSettings;
  }

  public async setPlayerSettings(settings: PlayerClientSettings) {
    await this.post(`players/settings`, JSON.stringify(settings));
  }

  public async getCvars<
    TCvars extends Cvar[],
    TResponse = Record<ArrayElementType<TCvars>, string>,
  >(...cvars: TCvars): Promise<TResponse> {
    const res = await this.query('POST', 'cvars/get', JSON.stringify(cvars));
    return JSON.parse(res) as TResponse;
  }

  public async getCvar(cvar: Cvar) {
    return (await this.getCvars(cvar))?.[cvar];
  }

  public async setCvar(cvar: Cvar, value: string) {
    return this.query('POST', 'cvars/set/' + cvar, JSON.stringify(value));
  }

  public async getMapsPreviews() {
    const res = await this.get('maps');

    return JSON.parse(res) as MapPreviewData[];
  }

  public async getMapDetails(mapName: string) {
    const res = await this.get('maps/' + mapName);

    return JSON.parse(res) as MapDetailsData;
  }

  public async setMapParent(mapName: string, parentMapName?: string) {
    if (parentMapName) {
      await this.post(`maps/parent/${mapName}/${parentMapName}`);
    } else {
      await this.delete(`maps/parent/${mapName}`);
    }
  }

  public async setMapDescription(mapName: string, description?: string) {
    await this.post(
      'maps/description/' + mapName,
      JSON.stringify({ description }),
    );
  }

  public async setMapImages(mapName: string, images: string[]) {
    await this.post('maps/images/' + mapName, JSON.stringify(images));
  }

  public async setMapTags(mapName: string, tags: string[]) {
    await this.post('maps/tags/' + mapName, JSON.stringify(tags));
  }

  public async setMapFavorite(mapName: string, favorite: boolean) {
    if (favorite) {
      await this.post('maps/favorite/' + mapName);
    } else {
      await this.delete('maps/favorite/' + mapName);
    }
  }

  public async runMap(mapName: string) {
    this.post('maps/changelevel/' + mapName);
  }

  public async getMapReviews(mapName: string) {
    const res = await this.get('maps/reviews/' + mapName);

    return JSON.parse(res) as MapReviewData[];
  }

  public async getPlayerReviews(steamId: string) {
    const res = await this.get('maps/reviews/player/' + steamId);

    return JSON.parse(res) as MapReviewData[];
  }

  public async postMapReview(mapName: string, review: MapReviewData) {
    const res = await this.post(
      'maps/reviews/' + mapName,
      JSON.stringify(review),
    );

    return JSON.parse(res) as MapReviewData;
  }

  public async deleteMapReview(mapName: string, authorSteamId?: string) {
    await this.delete(
      'maps/reviews/' + mapName + (authorSteamId ? '/' + authorSteamId : ''),
    );
  }

  public async getMapReactions(mapName: string) {
    const res = await this.get('maps/reactions/' + mapName);

    return JSON.parse(res) as ReactionData[];
  }

  public async addMapReaction(mapName: string, reaction: ReactionName) {
    await this.post(`maps/reactions/${mapName}/${reaction}`);
  }

  public async deleteMapReaction(mapName: string, reaction: ReactionName) {
    await this.delete(`maps/reactions/${mapName}/${reaction}`);
  }

  public async getMapReviewReactions(
    mapName: string,
    reviewAuthorSteamId: string,
  ) {
    const res = await this.get(
      `maps/reviews/reactions/${mapName}/${reviewAuthorSteamId}`,
    );

    return JSON.parse(res) as ReactionData[];
  }

  public async addMapReviewReaction(
    mapName: string,
    reviewAuthorSteamId: string,
    reaction: ReactionName,
  ) {
    await this.post(
      `maps/reviews/reactions/${mapName}/${reviewAuthorSteamId}/${reaction}`,
    );
  }

  public async deleteMapReviewReaction(
    mapName: string,
    reviewAuthorSteamId: string,
    reaction: ReactionName,
  ) {
    await this.delete(
      `maps/reviews/reactions/${mapName}/${reviewAuthorSteamId}/${reaction}`,
    );
  }

  public async getMatchResults(offset?: number) {
    const res = await this.get('match/results/' + offset ?? '');

    return JSON.parse(res) as PagedData<MatchSummary>;
  }

  public async getMatchResult(matchId: string) {
    const res = await this.get('match/' + matchId);

    return JSON.parse(res) as MatchSummary;
  }

  public async getMatchDeaths(matchId: string) {
    const res = await this.get('match/deaths/' + matchId);

    return JSON.parse(res) as MatchDeathData[];
  }

  public async getMatchDamage(matchId: string) {
    const res = await this.get('match/damage/' + matchId);

    return JSON.parse(res) as MatchDamageData[];
  }

  public async startMatch(settings: StartMatchSettings) {
    await this.post(`match/start`, JSON.stringify(settings));
  }

  public async runCommand(command: string) {
    await this.post(`srcds/runCommand`, JSON.stringify({ command }));
  }
}

export const motdApi = new MotdApi();
