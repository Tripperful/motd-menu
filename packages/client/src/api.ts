import {
  ArrayElementType,
  BalancedTeamsData,
  ChatCommandInfo,
  ClientSettingsMetadataData,
  ClientSettingsValues,
  CustomRankData,
  Cvar,
  EfpsMatchSummaryStat,
  MapDetailsData,
  MapPreviewData,
  MapReviewData,
  MatchDamageData,
  MatchDeathData,
  MatchFilters,
  MatchStateData,
  MatchSummary,
  MiscPlayerMatchStats,
  NewsCommentData,
  NewsData,
  NewsPreviewsPagedData,
  OnlinePlayerInfo,
  PagedData,
  Permission,
  RankData,
  ReactionData,
  ReactionName,
  ServerInfo,
  Severity,
  StartMatchSettings,
  SteamPlayerData,
} from '@motd-menu/common';

class MotdApi {
  private requestCache: Record<string, Promise<string>> = {};

  protected async query(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: string,
    search?: URLSearchParams,
  ): Promise<string> {
    const url = new URL(
      `${location.protocol}//${location.host}/api/${endpoint}`,
    ).toString();
    const searchStr = search ? '?' + search.toString() : '';
    const cacheKey = method + url + searchStr + (body ?? '');

    const cachedRequest = this.requestCache[cacheKey];

    if (cachedRequest) return cachedRequest;

    const resPromise = fetch(url + searchStr, {
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

  protected async get(
    endpoint: string,
    search?: URLSearchParams,
  ): Promise<string> {
    return this.query('GET', endpoint, undefined, search);
  }

  protected async post(endpoint: string, body?: string): Promise<string> {
    return this.query('POST', endpoint, body);
  }

  protected async put(endpoint: string, body?: string): Promise<string> {
    return this.query('PUT', endpoint, body);
  }

  protected async delete(endpoint: string, body?: string): Promise<string> {
    return this.query('DELETE', endpoint, body);
  }

  public async sendLog(severity: Severity, log: string) {
    await this.post('log', JSON.stringify({ severity, log }));
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
    const res = await this.get(
      'players/findByName/' + encodeURIComponent(name),
    );

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
      await this.post(`players/aka/${steamId}/${encodeURIComponent(name)}`);
    } else {
      await this.delete(`players/aka/${steamId}`);
    }
  }

  public async getPlayerAka(steamId: string) {
    return (await this.get(`players/aka/${steamId}`)) || null;
  }

  public async getPlayerStats(steamId: string) {
    return JSON.parse(await this.get(`players/stats/${steamId}`)) as RankData;
  }

  public async setPlayerCustomRank(
    steamId: string,
    customRank: CustomRankData,
  ) {
    await this.post(
      `players/customRank/${steamId}`,
      JSON.stringify({ customRank }),
    );
  }

  public async getPreferredLanguages() {
    return JSON.parse(await this.get('languages')) as string[];
  }

  public async setPreferredLanguages(languages: string[]) {
    await this.post('languages', JSON.stringify(languages));
  }

  public async getPlayerSettingsMetadata() {
    return JSON.parse(
      await this.get(`players/settings/metadata`),
    ) as ClientSettingsMetadataData;
  }

  public async getPlayerSettingsValues(steamId: string) {
    return JSON.parse(
      await this.get(`players/settings/values/${steamId}`),
    ) as ClientSettingsValues;
  }

  public async setPlayerSettings(settings: ClientSettingsValues) {
    await this.post(`players/settings/values`, JSON.stringify(settings));
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
    return this.query('POST', 'cvars/set/' + cvar, JSON.stringify({ value }));
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

  public async deleteTag(tag: string) {
    await this.delete('maps/tags/' + tag);
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

  public async getMatchState() {
    const res = await this.get('match');

    return JSON.parse(res) as MatchStateData;
  }

  public async replaceMatchPlayer(fromSteamId: string, toSteamId: string) {
    await this.post(`match/replace/${fromSteamId}/${toSteamId}`);
  }

  public async confirmReplacePlayer(whomSteamId: string) {
    await this.post(`match/rc/${whomSteamId}`);
  }

  public async getMatchResults(offset?: number, filters?: MatchFilters) {
    let search: URLSearchParams;

    if (filters) {
      search = new URLSearchParams();

      if (filters.mapName) search.append('mapName', filters.mapName);
      if (filters.players?.length)
        search.append('players', JSON.stringify(filters.players));
      if (filters.serverName) search.append('serverName', filters.serverName);
      if (filters.matchStatuses?.length)
        search.append('matchStatuses', JSON.stringify(filters.matchStatuses));
    }

    const res = await this.get('match/results/' + (offset ?? ''), search);

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

  public async getMatchAccuracy(matchId: string) {
    const res = await this.get('match/accuracy/' + matchId);

    return JSON.parse(res) as EfpsMatchSummaryStat[];
  }

  public async getMiscPlayerMatchStats(matchId: string, steamId: string) {
    const res = await this.get(`match/misc/${matchId}/${steamId}`);

    return JSON.parse(res) as MiscPlayerMatchStats;
  }

  public async startMatch(settings: StartMatchSettings) {
    await this.post(`match/start`, JSON.stringify(settings));
  }

  public async runCommand(command: string) {
    await this.post(`srcds/runCommand`, JSON.stringify({ command }));
  }

  public async getOnlineServers() {
    const res = await this.get('srcds/onlineServers');

    return JSON.parse(res) as ServerInfo[];
  }

  public async getOnlineServersMaps() {
    const res = await this.get('srcds/onlineServers/maps');

    return JSON.parse(res) as {
      serverInfo: ServerInfo;
      maps: string[];
    }[];
  }

  public async getOnlineServersPlayers() {
    const res = await this.get('srcds/onlineServers/players');

    const result = JSON.parse(res) as {
      serverInfo: ServerInfo;
      players: OnlinePlayerInfo[];
    }[];

    const fetchProfilesTasks: Promise<void>[] = [];

    for (const server of result) {
      for (const player of server.players ?? []) {
        fetchProfilesTasks.push(
          this.getPlayerSteamProfile(player.steamId).then((profile) => {
            player.steamProfile = profile;
          }),
        );
      }
    }

    await Promise.all(fetchProfilesTasks);

    return result;
  }

  public async getChatCommands() {
    const res = await this.get('srcds/chatCommands');

    return JSON.parse(res) as ChatCommandInfo[];
  }

  public async clientExec(command: string) {
    await this.post(`menu/clientExec`, JSON.stringify({ command }));
  }

  public async voteSpecPlayer(steamId: string) {
    await this.post(`menu/voteSpec/` + steamId);
  }

  public async getNewsPreviews(offset: number) {
    const res = await this.get('news/previews/' + offset);
    return JSON.parse(res) as NewsPreviewsPagedData;
  }

  public async getNews(id: string) {
    const res = await this.get('news/' + id);
    return JSON.parse(res) as NewsData;
  }

  public async createNews(title: string, content: string) {
    const res = await this.post('news', JSON.stringify({ title, content }));
    return JSON.parse(res) as NewsData;
  }

  public async editNews(id: string, title: string, content: string) {
    const res = await this.put(
      'news/' + id,
      JSON.stringify({ title, content }),
    );
    return JSON.parse(res) as NewsData;
  }

  public async publishNews(id: string) {
    await this.post('news/publish/' + id);
  }

  public async markNewsRead(id: string) {
    await this.post('news/markRead/' + id);
  }

  public async markNewsHidden(id: string) {
    await this.post('news/markHidden/' + id);
  }

  public async deleteNews(id: string) {
    await this.delete('news/' + id);
  }

  public async getNewsReactions(newsId: string) {
    const res = await this.get('news/reactions/' + newsId);
    return JSON.parse(res) as ReactionData[];
  }

  public async addNewsReaction(newsId: string, reaction: ReactionName) {
    await this.post(`news/reactions/${newsId}/${reaction}`);
  }

  public async deleteNewsReaction(newsId: string, reaction: ReactionName) {
    await this.delete(`news/reactions/${newsId}/${reaction}`);
  }

  public async getNewsComments(newsId: string) {
    const res = await this.get('news/comments/' + newsId);
    return JSON.parse(res) as NewsCommentData[];
  }

  public async addNewsComment(newsId: string, content: string) {
    const res = await this.post(
      'news/comments/' + newsId,
      JSON.stringify({ content }),
    );
    return JSON.parse(res).commentId as string;
  }

  public async editNewsComment(commentId: string, content: string) {
    await this.put('news/comments/' + commentId, JSON.stringify({ content }));
  }

  public async deleteNewsComment(commentId: string) {
    await this.delete('news/comments/' + commentId);
  }

  public async getNewsCommentReactions(commentId: string) {
    const res = await this.get('news/comments/reactions/' + commentId);
    return JSON.parse(res) as ReactionData[];
  }

  public async addNewsCommentReaction(
    commentId: string,
    reaction: ReactionName,
  ) {
    await this.post(`news/comments/reactions/${commentId}/${reaction}`);
  }

  public async deleteNewsCommentReaction(
    commentId: string,
    reaction: ReactionName,
  ) {
    await this.delete(`news/comments/reactions/${commentId}/${reaction}`);
  }

  public async getBalancedTeams(steamIds: string[]) {
    return JSON.parse(
      await this.post(`efps/balancer`, JSON.stringify(steamIds)),
    ) as Promise<BalancedTeamsData>;
  }

  public async applyBalancedTeams(players: string[]) {
    await this.post(`match/balance`, JSON.stringify({ players }));
  }
}

export const motdApi = new MotdApi();
