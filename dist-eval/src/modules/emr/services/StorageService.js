export class StorageService {
    static save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            if (typeof localStorage === 'undefined') {
                StorageService.memoryStorage[key] = serialized;
                return;
            }
            localStorage.setItem(key, serialized);
        }
        catch (error) {
            console.error(`Error saving data to localStorage with key "${key}":`, error);
        }
    }
    static load(key) {
        try {
            if (typeof localStorage === 'undefined') {
                const ser = StorageService.memoryStorage[key];
                return ser ? JSON.parse(ser) : null;
            }
            const serialized = localStorage.getItem(key);
            if (!serialized)
                return null;
            return JSON.parse(serialized);
        }
        catch (error) {
            console.error(`Error loading data from localStorage with key "${key}":`, error);
            return null;
        }
    }
    static remove(key) {
        try {
            if (typeof localStorage === 'undefined') {
                delete StorageService.memoryStorage[key];
                return;
            }
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error(`Error removing data from localStorage with key "${key}":`, error);
        }
    }
    static clear() {
        try {
            if (typeof localStorage === 'undefined') {
                StorageService.memoryStorage = {};
                return;
            }
            localStorage.clear();
        }
        catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}
Object.defineProperty(StorageService, "memoryStorage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {}
});
