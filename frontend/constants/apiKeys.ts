export const SIGORTAM_AFFILIATE_URL = process.env.EXPO_PUBLIC_SIGORTAM_URL ?? 'https://www.sigortam.net';

// Optional per-insurer affiliate URLs. Configure via EXPO_PUBLIC_AFFILIATE_<INSURER> env vars.
export const AFFILIATE_URLS: Record<string, string> = {
  allianz: process.env.EXPO_PUBLIC_AFFILIATE_ALLIANZ ?? '',
  aksigorta: process.env.EXPO_PUBLIC_AFFILIATE_AKSIGORTA ?? '',
  anadolu: process.env.EXPO_PUBLIC_AFFILIATE_ANADOLU ?? '',
  groupama: process.env.EXPO_PUBLIC_AFFILIATE_GROUPAMA ?? '',
  mapfre: process.env.EXPO_PUBLIC_AFFILIATE_MAPFRE ?? '',
};
