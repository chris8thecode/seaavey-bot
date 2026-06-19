export interface ScraperResult<T> {
  status: boolean;
  data: T;
  error?: string;
}

export function scraperSuccess<T>(data: T): ScraperResult<T> {
  return { status: true, data };
}

export function scraperError<T>(error: string): ScraperResult<T> {
  return { status: false, data: [] as T, error };
}

export type { FbdlData } from "./fbdl";
export { fsaver } from "./fbdl";
export type { InstagramMedia } from "./instagram";
export { instagramDl } from "./instagram";
export type { PinterestPin } from "./pinterest";
export { pinterestDl, pinterestSearch } from "./pinterest";
export type { SoundCloudSearchResult, SoundCloudTrack } from "./soundcloud";
export { soundcloudDl, soundcloudSearch } from "./soundcloud";
export type { ThreadsMedia } from "./threads";
export { threadsDl } from "./threads";
export type { SpotifyData } from "./spotify";
export { spotify, spotifySearch } from "./spotify";
export type { YouTubeData } from "./youtube";
export { ytmp3, ytmp4 } from "./youtube";
export { geniusSearch, geniusLyrics } from "./genius";
export type { MediaFireData } from "./mediafire";
export { mediafireDl } from "./mediafire";
export type { TwitterData } from "./twitter";
export { twitterDl } from "./twitter";
export type { SswebData } from "./ssweb";
export { sswebDl } from "./ssweb";
