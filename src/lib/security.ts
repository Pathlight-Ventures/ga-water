import { z } from 'zod'

// Input validation schemas
export const searchSchema = z.object({
  searchTerm: z.string().max(100).optional(),
  stateCode: z.string().length(2).optional(),
  pwsType: z.enum(['CWS', 'TNCWS', 'NTNCWS']).optional(),
  activityStatus: z.enum(['A', 'I', 'N', 'M', 'P']).optional(),
  hasViolations: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).max(1000).default(0)
})

export const pwsidSchema = z.object({
  pwsid: z.string().length(9).regex(/^[A-Z0-9]{9}$/)
})

export const violationSchema = z.object({
  pwsid: z.string().length(9).regex(/^[A-Z0-9]{9}$/),
  status: z.enum(['Resolved', 'Archived', 'Addressed', 'Unaddressed']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).max(1000).default(0)
})

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

// Rate limiting helper
export class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>()
  
  isAllowed(identifier: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const record = this.store.get(identifier)
    
    if (record && now < record.resetTime) {
      if (record.count >= maxRequests) {
        return false
      }
      record.count++
    } else {
      this.store.set(identifier, { count: 1, resetTime: now + windowMs })
    }
    
    return true
  }
  
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Security utilities
export function validatePWSID(pwsid: string): boolean {
  return /^[A-Z0-9]{9}$/.test(pwsid)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string): boolean {
  return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// Logging for security events
export function logSecurityEvent(event: string, details: Record<string, unknown>) {
  console.log(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details
  })
}

// Export validation
export const exportSchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  filters: z.record(z.unknown()).optional(),
  limit: z.number().min(1).max(10000).default(1000)
}) 