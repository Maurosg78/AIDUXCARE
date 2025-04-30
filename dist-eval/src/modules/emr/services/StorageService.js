export class StorageService {
    static save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
        }
        catch (error) {
            console.error(`Error saving data to localStorage with key "${key}":`, error);
        }
    }
    static load(key) {
        try {
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
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error(`Error removing data from localStorage with key "${key}":`, error);
        }
    }
    static clear() {
        try {
            localStorage.clear();
        }
        catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}
