// __test__/integration/api/upload.test.ts
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

// Track created records for cleanup
const createdRecordIds: string[] = []
let testUserId: string
let testUserEmail: string
let testToken: string

// Track whether we should return a token or not (for unauthenticated test cases)
let shouldReturnToken = true

// Mock next/headers for cookies functionality
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn((name: string) => {
    if (name === 'auth-token' && shouldReturnToken && testToken) {
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
const { POST: uploadHandler } = await import('@/app/api/upload/route')

// Helper to create a mock NextRequest with FormData
function createFormDataRequest(url: string, file: File | null): NextRequest {
  const formData = new FormData()
  if (file) {
    formData.append('file', file)
  }

  return new NextRequest(url, {
    method: 'POST',
    body: formData,
  })
}

// Helper to create a CSV file from content
function createCSVFile(content: string, filename: string = 'test.csv'): File {
  return new File([content], filename, { type: 'text/csv' })
}

// Sample valid CSV content with full datetime format for bedTime/wakeTime
const validCSVContent = `date,bedTime,wakeTime,sleepDuration,deepSleep,lightSleep,remSleep,awakeCount,sleepScore,heartRate
2026-04-01,2026-03-31T23:00:00,2026-04-01T07:00:00,8.0,2.0,4.0,1.5,1,85,62
2026-04-02,2026-04-01T22:30:00,2026-04-02T06:30:00,8.0,2.5,3.5,1.5,0,90,58`

describe('Upload API Integration Tests', () => {
  beforeAll(async () => {
    // Create a test user
    const user = await testPrisma.user.create({
      data: {
        name: 'Upload Test User',
        email: `upload-test-${Date.now()}@example.com`,
        password: 'hashedPassword123',
      },
    })
    testUserId = user.id
    testUserEmail = user.email
    testToken = await generateTestToken(testUserId, testUserEmail)
  })

  afterEach(async () => {
    // Clean up test records
    if (createdRecordIds.length > 0) {
      try {
        await testPrisma.sleepRecord.deleteMany({
          where: {
            id: { in: createdRecordIds },
          },
        })
      } catch {
        // Ignore cleanup errors
      }
      createdRecordIds.length = 0
    }
    // Clear mock call counts but keep implementations
    mockCookieStore.set.mockClear()
    mockCookieStore.delete.mockClear()
    mockCookieStore.get.mockClear()
    // Reset to authenticated state
    shouldReturnToken = true
  })

  describe('POST /api/upload', () => {
    it('should reject unauthenticated requests', async () => {
      // Set flag to simulate no token
      shouldReturnToken = false

      const file = createCSVFile(validCSVContent)
      const request = createFormDataRequest('http://localhost:3000/api/upload', file)

      const response = await uploadHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('未登录')
    })

    it('should reject non-CSV files', async () => {
      const textFile = new File(['some content'], 'test.txt', { type: 'text/plain' })
      const request = createFormDataRequest('http://localhost:3000/api/upload', textFile)

      const response = await uploadHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Only CSV files are allowed')
    })

    it('should reject missing file', async () => {
      const request = createFormDataRequest('http://localhost:3000/api/upload', null)

      const response = await uploadHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No file uploaded')
    })

    it('should upload valid CSV successfully', async () => {
      const file = createCSVFile(validCSVContent)
      const request = createFormDataRequest('http://localhost:3000/api/upload', file)

      const response = await uploadHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.count).toBe(2)
      expect(data.failedCount).toBe(0)
      expect(data.records).toBeDefined()
      expect(data.records.length).toBe(2)
      expect(data.records[0].userId).toBe(testUserId)
      expect(data.records[0].sleepDuration).toBe(8.0)
      expect(data.records[0].sleepScore).toBe(85)

      // Track for cleanup
      createdRecordIds.push(...data.records.map((r: { id: string }) => r.id))
    })

    it('should reject empty CSV', async () => {
      const emptyCSV = 'date,bedTime,wakeTime,sleepDuration\n' // Header only, no data rows
      const file = createCSVFile(emptyCSV)
      const request = createFormDataRequest('http://localhost:3000/api/upload', file)

      const response = await uploadHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No valid data found in CSV')
    })
  })
})
