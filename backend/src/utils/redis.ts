import Redis from 'ioredis';
import { config } from '../config/environment';
import logger from './logger';

export class RedisClient {
  private client: Redis;
  private static instance: RedisClient;

  constructor() {
    this.client = new Redis({
      host: config.REDIS_HOST || 'localhost',
      port: parseInt(config.REDIS_PORT || '6379'),
      password: config.REDIS_PASSWORD,
      db: parseInt(config.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    this.setupEventHandlers();
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    this.client.on('ready', () => {
      logger.info('Redis ready to accept commands');
    });

    this.client.on('error', (error) => {
      logger.error('Redis connection error', { error });
    });

    this.client.on('close', () => {
      logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      logger.info('Redis client connected');
    } catch (error) {
      logger.error('Redis connection failed', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      logger.info('Redis client disconnected');
    } catch (error) {
      logger.error('Redis disconnection failed', { error });
    }
  }

  // 기본 Redis 명령어들
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET failed', { key, error });
      return null;
    }
  }

  async set(key: string, value: string): Promise<boolean> {
    try {
      const result = await this.client.set(key, value);
      return result === 'OK';
    } catch (error) {
      logger.error('Redis SET failed', { key, error });
      return false;
    }
  }

  async setex(key: string, ttl: number, value: string): Promise<boolean> {
    try {
      const result = await this.client.setex(key, ttl, value);
      return result === 'OK';
    } catch (error) {
      logger.error('Redis SETEX failed', { key, ttl, error });
      return false;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL failed', { key, error });
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS failed', { key, error });
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXPIRE failed', { key, ttl, error });
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL failed', { key, error });
      return -1;
    }
  }

  // Hash 명령어들
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      logger.error('Redis HGET failed', { key, field, error });
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      const result = await this.client.hset(key, field, value);
      return result >= 0;
    } catch (error) {
      logger.error('Redis HSET failed', { key, field, error });
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      logger.error('Redis HGETALL failed', { key, error });
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      return await this.client.hdel(key, field);
    } catch (error) {
      logger.error('Redis HDEL failed', { key, field, error });
      return 0;
    }
  }

  // List 명령어들
  async lpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.lpush(key, value);
    } catch (error) {
      logger.error('Redis LPUSH failed', { key, error });
      return 0;
    }
  }

  async rpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.rpush(key, value);
    } catch (error) {
      logger.error('Redis RPUSH failed', { key, error });
      return 0;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lpop(key);
    } catch (error) {
      logger.error('Redis LPOP failed', { key, error });
      return null;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key);
    } catch (error) {
      logger.error('Redis RPOP failed', { key, error });
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      logger.error('Redis LRANGE failed', { key, start, stop, error });
      return [];
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.client.llen(key);
    } catch (error) {
      logger.error('Redis LLEN failed', { key, error });
      return 0;
    }
  }

  // Set 명령어들
  async sadd(key: string, member: string): Promise<number> {
    try {
      return await this.client.sadd(key, member);
    } catch (error) {
      logger.error('Redis SADD failed', { key, member, error });
      return 0;
    }
  }

  async srem(key: string, member: string): Promise<number> {
    try {
      return await this.client.srem(key, member);
    } catch (error) {
      logger.error('Redis SREM failed', { key, member, error });
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS failed', { key, error });
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error) {
      logger.error('Redis SISMEMBER failed', { key, member, error });
      return false;
    }
  }

  // 유틸리티 메서드들
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS failed', { pattern, error });
      return [];
    }
  }

  async flushdb(): Promise<boolean> {
    try {
      const result = await this.client.flushdb();
      return result === 'OK';
    } catch (error) {
      logger.error('Redis FLUSHDB failed', { error });
      return false;
    }
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING failed', { error });
      return false;
    }
  }

  // 퀘스트 전용 메서드들
  async cacheQuests(userId: string, date: string, quests: any[], ttl: number = 3600): Promise<boolean> {
    const key = `user_quests:${userId}:${date}`;
    return this.setex(key, ttl, JSON.stringify(quests));
  }

  async getCachedQuests(userId: string, date: string): Promise<any[] | null> {
    const key = `user_quests:${userId}:${date}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateUserCache(userId: string, pattern: string = '*'): Promise<number> {
    try {
      const keys = await this.keys(`*${userId}*${pattern}`);
      if (keys.length === 0) return 0;
      
      const pipeline = this.client.pipeline();
      keys.forEach(key => pipeline.del(key));
      const results = await pipeline.exec();
      
      return results?.filter(result => result && result[1] === 1).length || 0;
    } catch (error) {
      logger.error('Redis cache invalidation failed', { userId, pattern, error });
      return 0;
    }
  }

  // 세션 관리 (향후 확장용)
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    const key = `session:${sessionId}`;
    return this.setex(key, ttl, JSON.stringify(data));
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async deleteSession(sessionId: string): Promise<number> {
    const key = `session:${sessionId}`;
    return this.del(key);
  }

  // 레이트 리미팅 (향후 확장용)
  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const current = await this.get(key);
      const count = current ? parseInt(current) : 0;
      
      if (count >= limit) {
        const ttl = await this.ttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + (ttl * 1000),
        };
      }
      
      const newCount = count + 1;
      if (count === 0) {
        await this.setex(key, window, newCount.toString());
      } else {
        await this.set(key, newCount.toString());
      }
      
      return {
        allowed: true,
        remaining: limit - newCount,
        resetTime: Date.now() + (window * 1000),
      };
    } catch (error) {
      logger.error('Rate limit check failed', { key, error });
      return { allowed: true, remaining: limit - 1, resetTime: Date.now() + (window * 1000) };
    }
  }

  // Raw Redis 클라이언트 접근 (고급 사용)
  getClient(): Redis {
    return this.client;
  }
}

// 싱글톤 인스턴스 내보내기
export default RedisClient.getInstance();