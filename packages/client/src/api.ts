import {
  ArrayElementType,
  Cvar,
  MapDetailsData,
  MapPreviewData,
  MapReviewData,
  Permission,
  SteamPlayerData,
  Severity,
} from '@motd-menu/common';

class MotdApi {
  private requestCache: Record<string, Promise<string>> = {};

  protected async query(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    body?: string,
  ): Promise<string> {
    const url = new URL('http://' + location.host + '/api/' + endpoint);

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
    this.post('log/' + severity, log);
  }

  public async closeMenu() {
    this.post('menu/close');
  }

  public async getPlayers() {
    const res = await this.get('players');

    return JSON.parse(res) as SteamPlayerData[];
  }

  public async getPlayer(steamId: string) {
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

  public async setTeam(teamIndex: number, steamId?: string) {
    this.post('teams/set/' + (steamId ? steamId + '/' : '') + teamIndex);
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
}

export const motdApi = new MotdApi();
