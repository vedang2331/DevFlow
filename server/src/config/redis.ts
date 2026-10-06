import Redis from 'ioredis';
import { config } from './env';

class RedisCacheManager {
  private client: Redis | null = null;
  private inMemoryStore = new Map<string, string>();
  public isConnected = false;

  constructor() {
    try {
      this.client = new Redis(config.redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't block app boot if Redis server is down
      });

      this.client.connect().then(() => {
        this.isConnected = true;
        console.log('✅ Redis connected successfully.');
      }).catch(() => {
        console.warn('⚠️ Redis not available. Falling back to in-memory cache.');
        this.client = null;
      });

      this.client.on('error', () => {
        this.isConnected = false;
      });
    } catch (e) {
      console.warn('⚠️ Redis initialization fallback triggered.');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        return this.inMemoryStore.get(key) || null;
      }
    }
    return this.inMemoryStore.get(key) || null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // Fallthrough to memory
      }
    }
    this.inMemoryStore.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => this.inMemoryStore.delete(key), ttlSeconds * 1000);
    }
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch {
        // ignore
      }
    }
    this.inMemoryStore.delete(key);
  }
}

export const redisCache = new RedisCacheManager();
