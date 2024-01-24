export interface MapPreviewData {
  id: number;
  parentMap?: string;
  name: string;
  rate?: number;
  numRates: number;
  image?: string;
  tags: string[];
  isFavorite?: boolean;
}

export interface MapDetailsData {
  name: string;
  description?: string;
  otherVersions?: string[];
  images: string[];
  tags: string[];
  isFavorite?: boolean;
}
