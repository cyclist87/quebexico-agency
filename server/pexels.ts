import { Router } from "express";

const router = Router();

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

router.get("/search", async (req, res) => {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "Pexels API key not configured" });
  }

  const { query, per_page = "15", page = "1", orientation, locale } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const params = new URLSearchParams({
      query,
      per_page: String(per_page),
      page: String(page),
    });

    if (orientation && typeof orientation === "string") {
      params.append("orientation", orientation);
    }

    if (locale && typeof locale === "string") {
      params.append("locale", locale);
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?${params.toString()}`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pexels API error:", response.status, errorText);
      return res.status(response.status).json({ 
        error: "Pexels API error", 
        details: errorText 
      });
    }

    const data: PexelsSearchResponse = await response.json();

    const transformedPhotos = data.photos.map((photo) => ({
      id: photo.id,
      width: photo.width,
      height: photo.height,
      url: photo.url,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      avgColor: photo.avg_color,
      alt: photo.alt || `Photo by ${photo.photographer}`,
      src: {
        original: photo.src.original,
        large: photo.src.large,
        medium: photo.src.medium,
        small: photo.src.small,
        tiny: photo.src.tiny,
        landscape: photo.src.landscape,
        portrait: photo.src.portrait,
      },
      attribution: {
        text: `Photo by ${photo.photographer} on Pexels`,
        photographerName: photo.photographer,
        photographerUrl: photo.photographer_url,
        pexelsUrl: photo.url,
      },
    }));

    res.json({
      totalResults: data.total_results,
      page: data.page,
      perPage: data.per_page,
      photos: transformedPhotos,
      hasMore: !!data.next_page,
    });
  } catch (error) {
    console.error("Pexels fetch error:", error);
    res.status(500).json({ error: "Failed to fetch from Pexels" });
  }
});

router.get("/curated", async (req, res) => {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "Pexels API key not configured" });
  }

  const { per_page = "15", page = "1" } = req.query;

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/curated?per_page=${per_page}&page=${page}`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "Pexels API error" });
    }

    const data: PexelsSearchResponse = await response.json();

    const transformedPhotos = data.photos.map((photo) => ({
      id: photo.id,
      width: photo.width,
      height: photo.height,
      url: photo.url,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      avgColor: photo.avg_color,
      alt: photo.alt || `Photo by ${photo.photographer}`,
      src: {
        original: photo.src.original,
        large: photo.src.large,
        medium: photo.src.medium,
        small: photo.src.small,
        tiny: photo.src.tiny,
        landscape: photo.src.landscape,
        portrait: photo.src.portrait,
      },
      attribution: {
        text: `Photo by ${photo.photographer} on Pexels`,
        photographerName: photo.photographer,
        photographerUrl: photo.photographer_url,
        pexelsUrl: photo.url,
      },
    }));

    res.json({
      totalResults: data.total_results,
      page: data.page,
      perPage: data.per_page,
      photos: transformedPhotos,
      hasMore: !!data.next_page,
    });
  } catch (error) {
    console.error("Pexels fetch error:", error);
    res.status(500).json({ error: "Failed to fetch from Pexels" });
  }
});

export default router;
