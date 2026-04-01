// __test__/integration/api/sleep-records.test.ts
import { describe, it, expect, afterEach, vi, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { SignJWT } from 'jose'

// Set test database URL before creating PrismaClient
// This must happen before any PrismaClient is instantiated
process.env.DATABASE_URL = `file:${process.cwd()}/prisma/test.db`
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'

// Create a test prisma client before any imports that use it
const testPrisma = new PrismaClient()

// Mock the prisma module to use our test client
vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
}))

// Test JWT secret (must match __test__/setup.ts)
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
// This mock needs to be set up before importing any route handlers
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
const { POST: createRecordHandler } = await import('@/app/api/sleep-records/route')
const { GET: getRecordHandler, PUT: updateRecordHandler, DELETE: deleteRecordHandler } = await import('@/app/api/sleep-records/[id]/route')
const { GET: listRecordsHandler } = await import('@/app/api/sleep-data/route')

// Helper to create a mock NextRequest with JSON body
function createPostRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

// Helper to create a mock NextRequest with auth token cookie
function createRequestWithAuth(
  url: string,
  options: { method?: string; body?: Record<string, unknown>; token?: string } = {}
): NextRequest {
  const token = options.token || testToken
  const headers: Record<string, string> = {
    Cookie: `auth-token=${token}`,
  }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
    return new NextRequest(url, {
      method: options.method || 'POST',
      headers,
      body: JSON.stringify(options.body),
    })
  }

  return new NextRequest(url, {
    method: options.method || 'GET',
    headers,
  })
}

// Helper to create params object for dynamic routes
function createParams(id: string) {
  return Promise.resolve({ id })
}

describe('Sleep Records API Integration Tests', () => {
  beforeAll(async () => {
    // Create a test user
    const user = await testPrisma.user.create({
      data: {
        name: 'Sleep Test User',
        email: `sleep-test-${Date.now()}@example.com`,
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

  describe('POST /api/sleep-records', () => {
    it('should create a sleep record successfully', async () => {
      const request = createRequestWithAuth('http://localhost:3000/api/sleep-records', {
        body: {
          date: '2026-04-01',
          sleepDuration: 7.5,
          bedTime: '23:00',
          wakeTime: '06:30',
          deepSleep: 2.0,
          lightSleep: 3.5,
          remSleep: 1.5,
          awakeCount: 1,
          sleepScore: 85,
          heartRate: 62,
        },
      })

      const response = await createRecordHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.record).toBeDefined()
      expect(data.record.sleepDuration).toBe(7.5)
      expect(data.record.sleepScore).toBe(85)
      expect(data.record.heartRate).toBe(62)
      expect(data.record.userId).toBe(testUserId)

      // Track for cleanup
      createdRecordIds.push(data.record.id)
    })

    it('should reject unauthenticated requests', async () => {
      // Set flag to simulate no token
      shouldReturnToken = false

      const request = createRequestWithAuth('http://localhost:3000/api/sleep-records', {
        body: {
          date: '2026-04-01',
          sleepDuration: 7.5,
        },
        token: '', // No token
      })

      const response = await createRecordHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('未登录')
    })

    it('should reject missing required fields', async () => {
      const request = createRequestWithAuth('http://localhost:3000/api/sleep-records', {
        body: {
          // Missing date and sleepDuration
          deepSleep: 2.0,
        },
      })

      const response = await createRecordHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('日期和睡眠时长为必填项')
    })

    it('should reject invalid sleep duration (zero or negative)', async () => {
      const request = createRequestWithAuth('http://localhost:3000/api/sleep-records', {
        body: {
          date: '2026-04-01',
          sleepDuration: 0,
        },
      })

      const response = await createRecordHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('睡眠时长必须大于0')
    })

    it('should reject invalid sleep score (out of range)', async () => {
      const request = createRequestWithAuth('http://localhost:3000/api/sleep-records', {
        body: {
          date: '2026-04-01',
          sleepDuration: 7.5,
          sleepScore: 150, // Out of 0-100 range
        },
      })

      const response = await createRecordHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('睡眠评分范围为0-100')
    })

    it('should reject invalid heart rate (out of range)', async () => {
      const request = createRequestWithAuth('http://localhost:3000/api/sleep-records', {
        body: {
          date: '2026-04-01',
          sleepDuration: 7.5,
          heartRate: 20, // Below 30
        },
      })

      const response = await createRecordHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('心率范围为30-200')
    })

    it('should reject duplicate date records', async () => {
      const date = '2026-04-02'

      // First record
      const request1 = createRequestWithAuth('http://localhost:3000/api/sleep-records', {
        body: {
          date,
          sleepDuration: 8.0,
        },
      })
      const response1 = await createRecordHandler(request1)
      const data1 = await response1.json()
      expect(response1.status).toBe(200)
      createdRecordIds.push(data1.record.id)

      // Second record with same date
      const request2 = createRequestWithAuth('http://localhost:3000/api/sleep-records', {
        body: {
          date,
          sleepDuration: 6.0,
        },
      })
      const response2 = await createRecordHandler(request2)
      const data2 = await response2.json()

      expect(response2.status).toBe(400)
      expect(data2.error).toBe('该日期已有睡眠记录')
    })
  })

  describe('GET /api/sleep-data (list records)', () => {
    it('should list user sleep records', async () => {
      // Create a test record first
      const record = await testPrisma.sleepRecord.create({
        data: {
          date: new Date('2026-04-01'),
          bedTime: new Date('2026-03-31T23:00:00'),
          wakeTime: new Date('2026-04-01T07:00:00'),
          sleepDuration: 8.0,
          userId: testUserId,
        },
      })
      createdRecordIds.push(record.id)

      const request = createRequestWithAuth('http://localhost:3000/api/sleep-data')
      const response = await listRecordsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.records).toBeDefined()
      expect(Array.isArray(data.records)).toBe(true)
      expect(data.records.length).toBeGreaterThan(0)
      expect(data.records[0].userId).toBe(testUserId)
    })

    it('should filter records by date range', async () => {
      // Create test records
      const record1 = await testPrisma.sleepRecord.create({
        data: {
          date: new Date('2026-03-15'),
          bedTime: new Date('2026-03-14T23:00:00'),
          wakeTime: new Date('2026-03-15T07:00:00'),
          sleepDuration: 8.0,
          userId: testUserId,
        },
      })
      const record2 = await testPrisma.sleepRecord.create({
        data: {
          date: new Date('2026-03-25'),
          bedTime: new Date('2026-03-24T23:00:00'),
          wakeTime: new Date('2026-03-25T07:00:00'),
          sleepDuration: 7.5,
          userId: testUserId,
        },
      })
      createdRecordIds.push(record1.id, record2.id)

      const request = createRequestWithAuth(
        'http://localhost:3000/api/sleep-data?startDate=2026-03-20&endDate=2026-03-31'
      )
      const response = await listRecordsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.records).toBeDefined()
      expect(data.records.length).toBe(1)
      expect(data.records[0].sleepDuration).toBe(7.5)
    })

    it('should reject unauthenticated requests', async () => {
      shouldReturnToken = false

      const request = new NextRequest('http://localhost:3000/api/sleep-data', {
        headers: {},
      })
      const response = await listRecordsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('未登录')
    })
  })

  describe('GET /api/sleep-records/[id]', () => {
    it('should get a single record by id', async () => {
      // Create a test record
      const record = await testPrisma.sleepRecord.create({
        data: {
          date: new Date('2026-04-01'),
          bedTime: new Date('2026-03-31T23:00:00'),
          wakeTime: new Date('2026-04-01T07:00:00'),
          sleepDuration: 7.5,
          sleepScore: 85,
          userId: testUserId,
        },
      })
      createdRecordIds.push(record.id)

      const request = createRequestWithAuth(`http://localhost:3000/api/sleep-records/${record.id}`)
      const response = await getRecordHandler(request, { params: createParams(record.id) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.record).toBeDefined()
      expect(data.record.id).toBe(record.id)
      expect(data.record.sleepScore).toBe(85)
    })

    it('should return 404 for non-existent record', async () => {
      const fakeId = 'non-existent-id'
      const request = createRequestWithAuth(`http://localhost:3000/api/sleep-records/${fakeId}`)
      const response = await getRecordHandler(request, { params: createParams(fakeId) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('记录不存在')
    })

    it('should not return records belonging to other users', async () => {
      // Create another user
      const otherUser = await testPrisma.user.create({
        data: {
          name: 'Other User',
          email: `other-${Date.now()}@example.com`,
          password: 'hashedPassword',
        },
      })

      // Create record for other user
      const record = await testPrisma.sleepRecord.create({
        data: {
          date: new Date('2026-04-01'),
          bedTime: new Date('2026-03-31T23:00:00'),
          wakeTime: new Date('2026-04-01T07:00:00'),
          sleepDuration: 8.0,
          userId: otherUser.id,
        },
      })

      // Try to access with test user
      const request = createRequestWithAuth(`http://localhost:3000/api/sleep-records/${record.id}`)
      const response = await getRecordHandler(request, { params: createParams(record.id) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('记录不存在')

      // Cleanup other user's record
      await testPrisma.sleepRecord.delete({ where: { id: record.id } })
      await testPrisma.user.delete({ where: { id: otherUser.id } })
    })
  })

  describe('PUT /api/sleep-records/[id]', () => {
    it('should update a sleep record successfully', async () => {
      // Create a test record
      const record = await testPrisma.sleepRecord.create({
        data: {
          date: new Date('2026-04-01'),
          bedTime: new Date('2026-03-31T23:00:00'),
          wakeTime: new Date('2026-04-01T07:00:00'),
          sleepDuration: 7.5,
          sleepScore: 80,
          userId: testUserId,
        },
      })
      createdRecordIds.push(record.id)

      const request = createRequestWithAuth(`http://localhost:3000/api/sleep-records/${record.id}`, {
        method: 'PUT',
        body: {
          date: '2026-04-01',
          sleepDuration: 8.0,
          sleepScore: 90,
        },
      })

      const response = await updateRecordHandler(request, { params: createParams(record.id) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.record).toBeDefined()
      expect(data.record.sleepDuration).toBe(8.0)
      expect(data.record.sleepScore).toBe(90)
    })

    it('should return 404 when updating non-existent record', async () => {
      const fakeId = 'non-existent-id'
      const request = createRequestWithAuth(`http://localhost:3000/api/sleep-records/${fakeId}`, {
        method: 'PUT',
        body: {
          sleepDuration: 8.0,
        },
      })

      const response = await updateRecordHandler(request, { params: createParams(fakeId) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('记录不存在')
    })

    it('should reject invalid sleep score on update', async () => {
      // Create a test record
      const record = await testPrisma.sleepRecord.create({
        data: {
          date: new Date('2026-04-01'),
          bedTime: new Date('2026-03-31T23:00:00'),
          wakeTime: new Date('2026-04-01T07:00:00'),
          sleepDuration: 7.5,
          userId: testUserId,
        },
      })
      createdRecordIds.push(record.id)

      const request = createRequestWithAuth(`http://localhost:3000/api/sleep-records/${record.id}`, {
        method: 'PUT',
        body: {
          date: '2026-04-01',
          sleepScore: -10, // Invalid
        },
      })

      const response = await updateRecordHandler(request, { params: createParams(record.id) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('睡眠评分范围为0-100')
    })
  })

  describe('DELETE /api/sleep-records/[id]', () => {
    it('should delete a sleep record successfully', async () => {
      // Create a test record
      const record = await testPrisma.sleepRecord.create({
        data: {
          date: new Date('2026-04-01'),
          bedTime: new Date('2026-03-31T23:00:00'),
          wakeTime: new Date('2026-04-01T07:00:00'),
          sleepDuration: 7.5,
          userId: testUserId,
        },
      })
      // Don't add to cleanup list since we're testing deletion

      const request = createRequestWithAuth(`http://localhost:3000/api/sleep-records/${record.id}`, {
        method: 'DELETE',
      })

      const response = await deleteRecordHandler(request, { params: createParams(record.id) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify record is deleted
      const deletedRecord = await testPrisma.sleepRecord.findUnique({
        where: { id: record.id },
      })
      expect(deletedRecord).toBeNull()
    })

    it('should return 404 when deleting non-existent record', async () => {
      const fakeId = 'non-existent-id'
      const request = createRequestWithAuth(`http://localhost:3000/api/sleep-records/${fakeId}`, {
        method: 'DELETE',
      })

      const response = await deleteRecordHandler(request, { params: createParams(fakeId) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('记录不存在')
    })

    it('should not delete records belonging to other users', async () => {
      // Create another user
      const otherUser = await testPrisma.user.create({
        data: {
          name: 'Other User 2',
          email: `other2-${Date.now()}@example.com`,
          password: 'hashedPassword',
        },
      })

      // Create record for other user
      const record = await testPrisma.sleepRecord.create({
        data: {
          date: new Date('2026-04-01'),
          bedTime: new Date('2026-03-31T23:00:00'),
          wakeTime: new Date('2026-04-01T07:00:00'),
          sleepDuration: 8.0,
          userId: otherUser.id,
        },
      })

      // Try to delete with test user
      const request = createRequestWithAuth(`http://localhost:3000/api/sleep-records/${record.id}`, {
        method: 'DELETE',
      })
      const response = await deleteRecordHandler(request, { params: createParams(record.id) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('记录不存在')

      // Cleanup
      await testPrisma.sleepRecord.delete({ where: { id: record.id } })
      await testPrisma.user.delete({ where: { id: otherUser.id } })
    })
  })
})
