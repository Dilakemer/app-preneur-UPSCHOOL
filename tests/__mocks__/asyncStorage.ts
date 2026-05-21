// tests/__mocks__/asyncStorage.ts
// @react-native-async-storage/async-storage mock'u

const store: Record<string, string> = {};

export default {
  getItem: jest.fn(async (key: string) => store[key] ?? null),
  setItem: jest.fn(async (key: string, value: string) => { store[key] = value; }),
  removeItem: jest.fn(async (key: string) => { delete store[key]; }),
  clear: jest.fn(async () => { Object.keys(store).forEach(k => delete store[k]); }),
  multiRemove: jest.fn(async (keys: string[]) => { keys.forEach(k => delete store[k]); }),
  getAllKeys: jest.fn(async () => Object.keys(store)),
};
