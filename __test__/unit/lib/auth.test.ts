import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock environment variables before importing auth module
vi.stubEnv('JWT_SECRET', 'test-jwt-secret-key-for-testing')

// Mock cookies
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}))

// Import after mocking
const {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  setAuthCookie,
  getCurrentUser,
  clearAuthCookie,
} = await import('@/lib/auth')

describe('auth utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword & verifyPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)
    })

    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(password, hashed)
      expect(isValid).toBe(true)
    })

    it('should reject wrong password', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword('wrongPassword', hashed)
      expect(isValid).toBe(false)
    })

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('JWT Token', () => {
    it('should sign and verify token correctly', async () => {
      const payload = { userId: 'user-123', email: 'test@example.com' }
      const token = await signToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const verified = await verifyToken(token)
      expect(verified).toMatchObject(payload)
    })

    it('should return null for invalid token', async () => {
      const verified = await verifyToken('invalid-token')
      expect(verified).toBeNull()
    })

    it('should return null for empty token', async () => {
      const verified = await verifyToken('')
      expect(verified).toBeNull()
    })
  })

  describe('Cookie operations', () => {
    it('should set auth cookie', async () => {
      const token = 'test-token-123'
      await setAuthCookie(token)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'auth-token',
        token,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      )
    })

    it('should get current user from cookie', async () => {
      const payload = { userId: 'user-123', email: 'test@example.com' }
      const token = await signToken(payload)

      mockCookieStore.get.mockReturnValue({ value: token })

      const user = await getCurrentUser()

      expect(user).toMatchObject(payload)
    })

    it('should return null when no auth cookie', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const user = await getCurrentUser()

      expect(user).toBeNull()
    })

    it('should clear auth cookie', async () => {
      await clearAuthCookie()

      expect(mockCookieStore.delete).toHaveBeenCalledWith('auth-token')
    })
  })
})
