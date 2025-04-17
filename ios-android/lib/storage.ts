import { MMKV } from "react-native-mmkv";
import { PersistStorage } from "zustand/middleware";

const storage = new MMKV();

export function clearStorage() {
  storage.clearAll();
}

export const zustandStorage: PersistStorage<any> = {
  setItem: (name: string, value: any) => {
    storage.set(name, JSON.stringify(value));
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    try {
      return value ? JSON.parse(value) : null;
    } catch (e) {
      return null;
    }
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

export const getJwtToken = (): string | null => {
  const userData = storage.getString("user");
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed.state?.jwtToken || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export default storage;
