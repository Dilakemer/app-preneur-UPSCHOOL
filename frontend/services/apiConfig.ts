import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const API_PORT = '3001';
const API_PATH = '/api';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getExpoHost = (): string | undefined => {
  const constants = Constants as any;
  const hostUri =
    Constants.expoConfig?.hostUri ??
    constants.manifest?.debuggerHost ??
    constants.manifest?.hostUri;

  if (typeof hostUri !== 'string' || !hostUri.trim()) return undefined;
  return hostUri.split(':')[0];
};

const isLocalNetworkHost = (host: string) =>
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host.startsWith('192.168.') ||
  host.startsWith('10.') ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

const normalizeForAndroidEmulator = (url: string) => {
  if (Platform.OS !== 'android' || Device.isDevice !== false) {
    return trimTrailingSlash(url);
  }

  try {
    const parsed = new URL(url);
    if (isLocalNetworkHost(parsed.hostname)) {
      parsed.hostname = '10.0.2.2';
    }
    return trimTrailingSlash(parsed.toString());
  } catch {
    return trimTrailingSlash(url);
  }
};

export const getApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) return normalizeForAndroidEmulator(envUrl);

  const expoHost = getExpoHost();
  if (expoHost) {
    return normalizeForAndroidEmulator(`http://${expoHost}:${API_PORT}${API_PATH}`);
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}${API_PATH}`;
  }

  return `http://localhost:${API_PORT}${API_PATH}`;
};

export const API_URL = getApiUrl();
