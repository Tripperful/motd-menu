export interface MapPreviewData {
  id: number;
  name: string;
  rate?: number;
  image?: string;
  tags: string[];
  isFavorite?: boolean;
}

export interface MapDetailsData {
  name: string;
  description?: string;
  images: string[];
  tags: string[];
  isFavorite?: boolean;
}
