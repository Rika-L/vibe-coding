// __test__/integration/api/auth.test.ts
import { describe, it, expect, afterEach, vi, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { SignJWT } from 'jose'

// Set test database URL before creating PrismaClient
process.env.DATABASE_URL = `file:${process.cwd()}/prisma/test.db`
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'

// Create a test prisma client before any imports that use it
const testPrisma = new PrismaClient()

// Mock the prisma module to use our test client
vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
}))

// Test JWT secret
const testJwtSecret = 'test-jwt-secret-key-for-testing'
const testKey = new TextEncoder().encode(testJwtSecret)

// Helper to generate a valid JWT token for testing
async function generateTestToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(testKey)
}

// Track created users for cleanup
const createdUserIds: string[] = []
let testUserId: string
let testUserEmail: string
let testToken: string

// Mock next/headers for cookies functionality
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn((name: string) => {
    if (name === 'auth-token' && testToken) {
      return { value: testToken }
    }
    return { value: null }
  }),
  delete: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}))

// Dynamic import of route handlers after mocks are in place
const { POST: registerHandler } = await import('@/app/api/auth/register/route')
const { POST: loginHandler } = await import('@/app/api/auth/login/route')

// Helper to create a mock NextRequest with JSON body
function createRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

// Helper to generate unique email for each test
function uniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${prefix}-${timestamp}-${random}@example.com`
}

describe('Auth API Integration Tests', () => {
  beforeAll(async () => {
    // Create a test user for login tests
    const { hashPassword } = await import('@/lib/auth')
    const hashedPassword = await hashPassword('password123')
    const user = await testPrisma.user.create({
      data: {
        email: 'logintest@test.com',
        password: hashedPassword,
        name: 'Login Test User',
      },
    })
    testUserId = user.id
    testUserEmail = user.email
    testToken = await generateTestToken(user.id, user.email)
    createdUserIds.push(user.id)
  })

  afterEach(async () => {
    // Clean up test users created during tests
    if (createdUserIds.length > 1) {
      try {
        await testPrisma.user.deleteMany({
          where: {
            id: { in: createdUserIds.slice(1) },
          },
        })
      } catch {
        // Ignore cleanup errors
      }
      createdUserIds.length = 1
    }
    vi.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const email = uniqueEmail('register')

      const request = createRequest('http://localhost:3000/api/auth/register', {
        name: 'Test User',
        email,
        password: 'password123',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(email)
      expect(data.user.name).toBe('Test User')

      // Verify cookie was set
      expect(mockCookieStore.set).toHaveBeenCalled()
    })

    it('should reject duplicate email registration', async () => {
      // Use the existing test user's email
      const request = createRequest('http://localhost:3000/api/auth/register', {
        name: 'Duplicate User',
        email: testUserEmail,
        password: 'password123',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('该邮箱已被注册')
    })

    it('should reject invalid email format', async () => {
      const request = createRequest('http://localhost:3000/api/auth/register', {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('请输入有效的邮箱地址')
    })

    it('should reject short password', async () => {
      const request = createRequest('http://localhost:3000/api/auth/register', {
        name: 'Test User',
        email: uniqueEmail('short'),
        password: '12345',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('密码至少 6 个字符')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginRequest = createRequest('http://localhost:3000/api/auth/login', {
        email: testUserEmail,
        password: 'password123',
      })

      const response = await loginHandler(loginRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(testUserEmail)

      // Verify cookie was set
      expect(mockCookieStore.set).toHaveBeenCalled()
    })

    it('should reject login with wrong password', async () => {
      const loginRequest = createRequest('http://localhost:3000/api/auth/login', {
        email: testUserEmail,
        password: 'wrongPassword',
      })

      const response = await loginHandler(loginRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('邮箱或密码错误')
    })

    it('should reject login with non-existent email', async () => {
      const loginRequest = createRequest('http://localhost:3000/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'anyPassword123',
      })

      const response = await loginHandler(loginRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('邮箱或密码错误')
    })

    it('should reject login with invalid email format', async () => {
      const loginRequest = createRequest('http://localhost:3000/api/auth/login', {
        email: 'not-an-email',
        password: 'password123',
      })

      const response = await loginHandler(loginRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('请输入有效的邮箱地址')
    })

    it('should reject login with empty password', async () => {
      const loginRequest = createRequest('http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: '',
      })

      const response = await loginHandler(loginRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('请输入密码')
    })
  })
})
