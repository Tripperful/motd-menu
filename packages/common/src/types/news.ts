import { PagedData } from './data';

export interface NewsPreview {
  id?: string;
  authorSteamId?: string;
  title: string;
  createdOn?: number;
  publishedOn?: number;
  readOn?: number;
}

export interface NewsData extends NewsPreview {
  content: string;
  readBy: string[];
}

export interface NewsPreviewsPagedData extends PagedData<NewsPreview> {
  unread: number;
}
