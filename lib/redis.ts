import { Redis } from "@upstash/redis"

// Upstash Redis configuration
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache keys
export const CACHE_KEYS = {
  PROFILES: "profiles:all",
  PROFILE: (id: string) => `profile:${id}`,
  SERVICES: "services:all",
  SERVICE: (id: string) => `service:${id}`,
  PROJECTS: "projects:all",
  PROJECT: (id: string) => `project:${id}`,
  PACKAGES: "packages:all",
  PACKAGE: (id: string) => `package:${id}`,
  FEATURES: "features:all",
  FEATURE: (id: string) => `feature:${id}`,
  USERS: "users:all",
  USER: (id: string) => `user:${id}`,
  ROLES: "roles:all",
  ROLE: (id: string) => `role:${id}`,
}

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
}

// Cache utility functions
export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key)
      return cached as T | null
    } catch (error) {
      console.error("Upstash Redis GET error:", error)
      return null
    }
  }

  static async set(key: string, value: any, ttl: number = CACHE_TTL.MEDIUM): Promise<boolean> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Upstash Redis SET error:", error)
      return false
    }
  }

  static async del(key: string | string[]): Promise<boolean> {
    try {
      if (Array.isArray(key)) {
        await redis.del(...key)
      } else {
        await redis.del(key)
      }
      return true
    } catch (error) {
      console.error("Upstash Redis DEL error:", error)
      return false
    }
  }

  static async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error("Upstash Redis INVALIDATE PATTERN error:", error)
      return false
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error("Upstash Redis EXISTS error:", error)
      return false
    }
  }

  // Specific cache methods for different entities
  static async cacheProfiles(profiles: any[], ttl: number = CACHE_TTL.MEDIUM) {
    await this.set(CACHE_KEYS.PROFILES, profiles, ttl)

    // Cache individual profiles
    for (const profile of profiles) {
      await this.set(CACHE_KEYS.PROFILE(profile._id), profile, ttl)
    }
  }

  static async getCachedProfiles() {
    return await this.get(CACHE_KEYS.PROFILES)
  }

  static async invalidateProfileCache(profileId?: string) {
    const keysToInvalidate = [CACHE_KEYS.PROFILES]

    if (profileId) {
      keysToInvalidate.push(CACHE_KEYS.PROFILE(profileId))
    }

    await this.del(keysToInvalidate)
  }

  static async cacheServices(services: any[], ttl: number = CACHE_TTL.MEDIUM) {
    await this.set(CACHE_KEYS.SERVICES, services, ttl)

    for (const service of services) {
      await this.set(CACHE_KEYS.SERVICE(service._id), service, ttl)
    }
  }

  static async getCachedServices() {
    return await this.get(CACHE_KEYS.SERVICES)
  }

  static async invalidateServiceCache(serviceId?: string) {
    const keysToInvalidate = [CACHE_KEYS.SERVICES]

    if (serviceId) {
      keysToInvalidate.push(CACHE_KEYS.SERVICE(serviceId))
    }

    await this.del(keysToInvalidate)
  }

  static async cacheProjects(projects: any[], ttl: number = CACHE_TTL.MEDIUM) {
    await this.set(CACHE_KEYS.PROJECTS, projects, ttl)

    for (const project of projects) {
      await this.set(CACHE_KEYS.PROJECT(project._id), project, ttl)
    }
  }

  static async getCachedProjects() {
    return await this.get(CACHE_KEYS.PROJECTS)
  }

  static async invalidateProjectCache(projectId?: string) {
    const keysToInvalidate = [CACHE_KEYS.PROJECTS]

    if (projectId) {
      keysToInvalidate.push(CACHE_KEYS.PROJECT(projectId))
    }

    await this.del(keysToInvalidate)
  }
}

export default redis
