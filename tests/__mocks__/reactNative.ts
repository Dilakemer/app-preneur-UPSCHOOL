// tests/__mocks__/reactNative.ts
// Minimal react-native mock — yalnızca kullanılan API'ler

export const Platform = {
  OS: 'ios',
  select: (obj: Record<string, unknown>) => obj.ios ?? obj.default,
};

export const Linking = {
  openURL: jest.fn(() => Promise.resolve()),
  openSettings: jest.fn(() => Promise.resolve()),
};

export const Alert = {
  alert: jest.fn(),
};

export const AppState = {
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  currentState: 'active',
};

export default {
  Platform,
  Linking,
  Alert,
  AppState,
};
