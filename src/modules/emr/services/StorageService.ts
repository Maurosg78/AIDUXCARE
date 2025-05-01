export class StorageService {
  private static memoryStorage: Record<string, string> = {};

  static save<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      if (typeof localStorage === 'undefined') {
        StorageService.memoryStorage[key] = serialized;
        return;
      }
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving data to localStorage with key "${key}":`, error);
    }
  }

  static load<T>(key: string): T | null {
    try {
      if (typeof localStorage === 'undefined') {
        const ser = StorageService.memoryStorage[key];
        return ser ? (JSON.parse(ser) as T) : null;
      }
      const serialized = localStorage.getItem(key);
      if (!serialized) return null;
      return JSON.parse(serialized) as T;
    } catch (error) {
      console.error(`Error loading data from localStorage with key "${key}":`, error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      if (typeof localStorage === 'undefined') {
        delete StorageService.memoryStorage[key];
        return;
      }
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data from localStorage with key "${key}":`, error);
    }
  }

  static clear(): void {
    try {
      if (typeof localStorage === 'undefined') {
        StorageService.memoryStorage = {};
        return;
      }
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
