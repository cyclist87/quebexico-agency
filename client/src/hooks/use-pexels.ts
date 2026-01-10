import { useQuery } from "@tanstack/react-query";

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographerUrl: string;
  avgColor: string;
  alt: string;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
    tiny: string;
    landscape: string;
    portrait: string;
  };
  attribution: {
    text: string;
    photographerName: string;
    photographerUrl: string;
    pexelsUrl: string;
  };
}

interface PexelsSearchResponse {
  totalResults: number;
  page: number;
  perPage: number;
  photos: PexelsPhoto[];
  hasMore: boolean;
}

interface SearchOptions {
  query: string;
  perPage?: number;
  page?: number;
  orientation?: "landscape" | "portrait" | "square";
  locale?: string;
  enabled?: boolean;
}

export function usePexelsSearch({
  query,
  perPage = 15,
  page = 1,
  orientation,
  locale,
  enabled = true,
}: SearchOptions) {
  return useQuery<PexelsSearchResponse>({
    queryKey: ["/api/pexels/search", query, perPage, page, orientation, locale],
    queryFn: async () => {
      const params = new URLSearchParams({
        query,
        per_page: String(perPage),
        page: String(page),
      });

      if (orientation) {
        params.append("orientation", orientation);
      }

      if (locale) {
        params.append("locale", locale);
      }

      const response = await fetch(`/api/pexels/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to search Pexels");
      }
      return response.json();
    },
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePexelsCurated({
  perPage = 15,
  page = 1,
  enabled = true,
}: {
  perPage?: number;
  page?: number;
  enabled?: boolean;
} = {}) {
  return useQuery<PexelsSearchResponse>({
    queryKey: ["/api/pexels/curated", perPage, page],
    queryFn: async () => {
      const response = await fetch(
        `/api/pexels/curated?per_page=${perPage}&page=${page}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch curated photos");
      }
      return response.json();
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
