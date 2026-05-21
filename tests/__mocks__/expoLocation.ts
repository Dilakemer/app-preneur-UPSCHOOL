// tests/__mocks__/expoLocation.ts
// expo-location mock

export const requestForegroundPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted' }),
);
export const getCurrentPositionAsync = jest.fn(() =>
  Promise.resolve({ coords: { latitude: 41.0082, longitude: 28.9784 } }),
);
export const Accuracy = { High: 5, Balanced: 3, Low: 1 };
export default {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  Accuracy,
};
