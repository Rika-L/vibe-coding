// __test__/integration/api/auth.test.ts
import { describe, it, expect, afterEach, vi, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Create a test prisma client before any imports that use it
const testPrisma = new PrismaClient()

// Mock the prisma module to use our test client
vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
}))

// Mock next/headers for cookies functionality
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn().mockReturnValue({ value: null }),
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
  // Track users created during tests for cleanup
  const createdUserEmails: string[] = []

  afterEach(async () => {
    // Clean up test users using the test prisma client
    if (createdUserEmails.length > 0) {
      try {
        await testPrisma.user.deleteMany({
          where: {
            email: { in: createdUserEmails },
          },
        })
      } catch {
        // Ignore cleanup errors
      }
      createdUserEmails.length = 0
    }
    // Reset mocks
    vi.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const email = uniqueEmail('register')
      createdUserEmails.push(email)

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
      expect(data.user.id).toBeDefined()
      expect(data.user.password).toBeUndefined() // Password should not be returned

      // Verify cookie was set
      expect(mockCookieStore.set).toHaveBeenCalled()
    })

    it('should reject duplicate email registration', async () => {
      const email = uniqueEmail('duplicate')
      createdUserEmails.push(email)

      // First registration
      const request1 = createRequest('http://localhost:3000/api/auth/register', {
        name: 'First User',
        email,
        password: 'password123',
      })
      await registerHandler(request1)

      // Second registration with same email
      const request2 = createRequest('http://localhost:3000/api/auth/register', {
        name: 'Second User',
        email,
        password: 'password456',
      })
      const response = await registerHandler(request2)
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
        password: '12345', // Only 5 characters
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('密码至少 6 个字符')
    })

    it('should register without name (optional field)', async () => {
      const email = uniqueEmail('noname')
      createdUserEmails.push(email)

      const request = createRequest('http://localhost:3000/api/auth/register', {
        email,
        password: 'password123',
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.email).toBe(email)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const email = uniqueEmail('login')
      createdUserEmails.push(email)

      // First register a user
      const registerRequest = createRequest('http://localhost:3000/api/auth/register', {
        name: 'Login Test User',
        email,
        password: 'password123',
      })
      await registerHandler(registerRequest)

      // Reset mock call count before login
      mockCookieStore.set.mockClear()

      // Then login
      const loginRequest = createRequest('http://localhost:3000/api/auth/login', {
        email,
        password: 'password123',
      })

      const response = await loginHandler(loginRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(email)
      expect(data.user.name).toBe('Login Test User')

      // Verify cookie was set
      expect(mockCookieStore.set).toHaveBeenCalled()
    })

    it('should reject login with wrong password', async () => {
      const email = uniqueEmail('wrongpass')
      createdUserEmails.push(email)

      // Register a user
      const registerRequest = createRequest('http://localhost:3000/api/auth/register', {
        name: 'Wrong Pass User',
        email,
        password: 'correctPassword',
      })
      await registerHandler(registerRequest)

      // Try to login with wrong password
      const loginRequest = createRequest('http://localhost:3000/api/auth/login', {
        email,
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
