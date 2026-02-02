import type {
  DirectSiteConfig,
  DirectSiteProperty,
  DirectSiteAvailability,
  DirectSitePricing,
  ReservationRequest,
  ReservationResponse,
  InquiryRequest,
  InquiryResponse,
} from "@shared/direct-sites";

const DIRECT_SITES_API_PATH = "/api/external/direct-sites";

export class DirectSiteClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${DIRECT_SITES_API_PATH}${endpoint}`);
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
      throw new Error(`Direct site API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${DIRECT_SITES_API_PATH}${endpoint}`, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Direct site API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getConfig(): Promise<DirectSiteConfig> {
    return this.fetch<DirectSiteConfig>("/config");
  }

  async getProperties(): Promise<DirectSiteProperty[]> {
    return this.fetch<DirectSiteProperty[]>("/properties");
  }

  async getAvailability(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<DirectSiteAvailability> {
    return this.fetch<DirectSiteAvailability>("/availability", {
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
  ): Promise<DirectSitePricing> {
    return this.fetch<DirectSitePricing>("/pricing", {
      propertyId,
      checkIn,
      checkOut,
      guests: guests?.toString() || "",
    });
  }

  async createReservation(data: ReservationRequest & { nightlyRate?: number; cleaningFee?: number; totalPrice?: number; currency?: string }): Promise<ReservationResponse> {
    const body = {
      propertyId: data.propertyId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestFirstName: data.guest.firstName,
      guestLastName: data.guest.lastName,
      guestEmail: data.guest.email,
      guestPhone: data.guest.phone ?? undefined,
      guestCount: data.guest.guests ?? 1,
      guestMessage: data.guest.message ?? undefined,
      nightlyRate: data.nightlyRate,
      cleaningFee: data.cleaningFee,
      totalPrice: data.totalPrice,
      currency: data.currency ?? "CAD",
    };
    return this.post<ReservationResponse>("/reservations", body);
  }

  async createInquiry(data: InquiryRequest): Promise<InquiryResponse> {
    return this.post<InquiryResponse>("/inquiries", data);
  }
}

const DIRECT_SITE_URL_KEY = "direct_site_api_url";
const DIRECT_SITE_API_KEY_SETTING = "direct_site_api_key";

/** Décryptage injecté par les routes (évite import circulaire). */
let directSiteDecrypt: (s: string) => string = (s) => s;
let directSiteIsEncrypted: (s: string) => boolean = () => false;

export function setDirectSiteDecrypt(fn: (s: string) => string, check: (s: string) => boolean) {
  directSiteDecrypt = fn;
  directSiteIsEncrypted = check;
}

/** Storage minimal pour lire les paramètres admin (évite dépendance circulaire). */
export interface DirectSiteStorage {
  getSetting(key: string): Promise<{ value: string | null } | undefined>;
}

let envClientCache: DirectSiteClient | null = null;

function getClientFromEnv(): DirectSiteClient | null {
  const apiKey = process.env.DIRECT_SITE_API_KEY;
  const baseUrl = process.env.DIRECT_SITE_API_URL;
  if (!apiKey || !baseUrl) return null;
  if (!envClientCache) envClientCache = new DirectSiteClient(baseUrl, apiKey);
  return envClientCache;
}

/** Récupère les identifiants : d’abord variables d’environnement, sinon paramètres admin (DB). */
export async function getDirectSiteCredentials(
  storage: DirectSiteStorage
): Promise<{ baseUrl: string; apiKey: string } | null> {
  const fromEnv = process.env.DIRECT_SITE_API_URL && process.env.DIRECT_SITE_API_KEY;
  if (fromEnv) {
    return {
      baseUrl: process.env.DIRECT_SITE_API_URL!,
      apiKey: process.env.DIRECT_SITE_API_KEY!,
    };
  }
  const urlSetting = await storage.getSetting(DIRECT_SITE_URL_KEY);
  const keySetting = await storage.getSetting(DIRECT_SITE_API_KEY_SETTING);
  const baseUrl = urlSetting?.value?.trim() || null;
  let apiKey = keySetting?.value?.trim() || null;
  if (apiKey) {
    try {
      if (directSiteIsEncrypted(apiKey)) apiKey = directSiteDecrypt(apiKey);
    } catch {
      apiKey = null;
    }
  }
  if (baseUrl && apiKey) return { baseUrl, apiKey };
  return null;
}

export function getDirectSiteClient(): DirectSiteClient | null {
  return getClientFromEnv();
}

/** Client depuis env ou paramètres admin ; à utiliser dans les routes avec storage. */
export async function getDirectSiteClientAsync(
  storage: DirectSiteStorage
): Promise<DirectSiteClient | null> {
  const fromEnv = getClientFromEnv();
  if (fromEnv) return fromEnv;
  const creds = await getDirectSiteCredentials(storage);
  if (!creds) return null;
  return new DirectSiteClient(creds.baseUrl, creds.apiKey);
}

export function isDirectSiteEnabled(): boolean {
  return !!getClientFromEnv();
}

/** Vérifie si la connexion est configurée (env ou admin). */
export async function isDirectSiteEnabledAsync(storage: DirectSiteStorage): Promise<boolean> {
  if (getClientFromEnv()) return true;
  const creds = await getDirectSiteCredentials(storage);
  return !!creds;
}
