import type {
  HostProConfig,
  HostProProperty,
  HostProAvailability,
  HostProPricing,
} from "@shared/hostpro";

export class HostProClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HostPro API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getConfig(): Promise<HostProConfig> {
    return this.fetch<HostProConfig>("/config");
  }

  async getProperties(): Promise<HostProProperty[]> {
    return this.fetch<HostProProperty[]>("/properties");
  }

  async getAvailability(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<HostProAvailability> {
    return this.fetch<HostProAvailability>("/availability", {
      propertyId,
      startDate,
      endDate,
    });
  }

  async getPricing(
    propertyId: string,
    checkIn: string,
    checkOut: string,
    guests?: number
  ): Promise<HostProPricing> {
    return this.fetch<HostProPricing>("/pricing", {
      propertyId,
      checkIn,
      checkOut,
      guests: guests?.toString() || "",
    });
  }
}

let hostProClient: HostProClient | null = null;

export function getHostProClient(): HostProClient | null {
  const apiKey = process.env.HOSTPRO_API_KEY;
  const baseUrl = process.env.HOSTPRO_API_URL;

  if (!apiKey || !baseUrl) {
    return null;
  }

  if (!hostProClient) {
    hostProClient = new HostProClient(baseUrl, apiKey);
  }

  return hostProClient;
}

export function isHostProEnabled(): boolean {
  return !!(process.env.HOSTPRO_API_KEY && process.env.HOSTPRO_API_URL);
}
