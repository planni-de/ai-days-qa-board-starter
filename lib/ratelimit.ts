import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

const redis = hasRedis ? Redis.fromEnv() : null

export const submitLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      prefix: 'qa:submit',
    })
  : null

export const voteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'qa:vote',
    })
  : null

export function getIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '0.0.0.0'
}
