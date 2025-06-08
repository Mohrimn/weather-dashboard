import { WeatherData, WeatherForecast } from '../types/weather';

const DB_NAME = 'weatherHistory';
const DB_VERSION = 1;
const CURRENT_WEATHER_STORE = 'currentWeather';
const FORECAST_STORE = 'forecast';

interface HistoricalData {
  timestamp: string;
  data: WeatherData[] | WeatherForecast[];
}

class HistoricalDataService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(CURRENT_WEATHER_STORE)) {
          db.createObjectStore(CURRENT_WEATHER_STORE, { keyPath: 'timestamp' });
        }
        if (!db.objectStoreNames.contains(FORECAST_STORE)) {
          db.createObjectStore(FORECAST_STORE, { keyPath: 'timestamp' });
        }
      };
    });
  }

  async storeCurrentWeather(data: WeatherData[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(CURRENT_WEATHER_STORE, 'readwrite');
      const store = transaction.objectStore(CURRENT_WEATHER_STORE);
      const timestamp = new Date().toISOString();

      const request = store.put({ timestamp, data });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async storeForecast(data: WeatherForecast[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(FORECAST_STORE, 'readwrite');
      const store = transaction.objectStore(FORECAST_STORE);
      const timestamp = new Date().toISOString();

      const request = store.put({ timestamp, data });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getHistoricalCurrentWeather(startDate: Date, endDate: Date): Promise<WeatherData[][]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(CURRENT_WEATHER_STORE, 'readonly');
      const store = transaction.objectStore(CURRENT_WEATHER_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const allData = request.result as HistoricalData[];
        const filteredData = allData
          .filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= startDate && itemDate <= endDate;
          })
          .map(item => item.data as WeatherData[]);
        resolve(filteredData);
      };
    });
  }

  async getHistoricalForecast(startDate: Date, endDate: Date): Promise<WeatherForecast[][]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(FORECAST_STORE, 'readonly');
      const store = transaction.objectStore(FORECAST_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const allData = request.result as HistoricalData[];
        const filteredData = allData
          .filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= startDate && itemDate <= endDate;
          })
          .map(item => item.data as WeatherForecast[]);
        resolve(filteredData);
      };
    });
  }

  async clearOldData(daysToKeep: number): Promise<void> {
    if (!this.db) await this.init();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const clearStore = async (storeName: string) => {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const allData = request.result as HistoricalData[];
          const deletePromises = allData
            .filter(item => new Date(item.timestamp) < cutoffDate)
            .map(item => {
              return new Promise((resolve, reject) => {
                const deleteRequest = store.delete(item.timestamp);
                deleteRequest.onerror = () => reject(deleteRequest.error);
                deleteRequest.onsuccess = () => resolve(undefined);
              });
            });

          Promise.all(deletePromises).then(resolve).catch(reject);
        };
      });
    };

    await Promise.all([
      clearStore(CURRENT_WEATHER_STORE),
      clearStore(FORECAST_STORE)
    ]);
  }
}

export const historicalDataService = new HistoricalDataService(); 