// tests/__mocks__/expoNotifications.ts
// expo-notifications mock

export const AndroidImportance = { HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1, NONE: 0 };

export const requestPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted' }),
);
export const getPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted' }),
);
export const scheduleNotificationAsync = jest.fn(() =>
  Promise.resolve('mock-notification-id'),
);
export const cancelScheduledNotificationAsync = jest.fn(() => Promise.resolve());
export const cancelAllScheduledNotificationsAsync = jest.fn(() => Promise.resolve());
export const getAllScheduledNotificationsAsync = jest.fn(() => Promise.resolve([]));
export const setNotificationChannelAsync = jest.fn(() => Promise.resolve());
export const addNotificationResponseReceivedListener = jest.fn(() => ({
  remove: jest.fn(),
}));
export const getLastNotificationResponseAsync = jest.fn(() =>
  Promise.resolve(null),
);
