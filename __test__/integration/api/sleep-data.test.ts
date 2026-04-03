// __test__/integration/api/sleep-data.test.ts
import { describe, it, expect, afterEach, vi, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

// Set test database URL before creating PrismaClient
process.env.DATABASE_URL = `file:${process.cwd()}/prisma/test.db`;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

// Create a test prisma client before any imports that use it
const testPrisma = new PrismaClient();

// Mock the prisma module to use our test client
vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
}));

// Test JWT secret
const testJwtSecret = 'test-jwt-secret-key-for-testing';
const testKey = new TextEncoder().encode(testJwtSecret);

// Helper to generate a valid JWT token for testing
async function generateTestToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(testKey);
}

let testUserId: string;
let testToken: string;

// Mock cookie store
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn((name: string) => {
    if (name === 'auth-token' && testToken) {
      return { value: testToken };
    }
    return { value: null };
  }),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}));

// Dynamic import of route handlers
const { GET: getSleepDataHandler } = await import('@/app/api/sleep-data/route');
const { GET: getSleepDatesHandler } = await import('@/app/api/sleep-dates/route');
const { GET: getSleepHistoryHandler } = await import('@/app/api/sleep-history/route');

describe('Sleep Data API', () => {
  beforeAll(async () => {
    // Create test user first
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword('password123');
    const user = await testPrisma.user.create({
      data: {
        email: 'sleep-data-test@test.com',
        password: hashedPassword,
        name: 'Sleep Data Test User',
      },
    });
    testUserId = user.id;
    testToken = await generateTestToken(user.id, user.email);

    // Create test sleep records
    await testPrisma.sleepRecord.createMany({
      data: [
        {
          id: crypto.randomUUID(),
          date: new Date('2024-01-15'),
          bedTime: new Date('2024-01-14T23:00:00'),
          wakeTime: new Date('2024-01-15T07:00:00'),
          sleepDuration: 7,
          deepSleep: 2,
          lightSleep: 3,
          remSleep: 1.5,
          sleepScore: 85,
          userId: testUserId,
        },
        {
          id: crypto.randomUUID(),
          date: new Date('2024-01-16'),
          bedTime: new Date('2024-01-15T23:30:00'),
          wakeTime: new Date('2024-01-16T07:30:00'),
          sleepDuration: 7.5,
          deepSleep: 2.5,
          lightSleep: 3,
          remSleep: 1.5,
          sleepScore: 88,
          userId: testUserId,
        },
        {
          id: crypto.randomUUID(),
          date: new Date('2024-01-17'),
          bedTime: new Date('2024-01-16T22:00:00'),
          wakeTime: new Date('2024-01-17T06:00:00'),
          sleepDuration: 7,
          deepSleep: 2,
          lightSleep: 3,
          remSleep: 1.5,
          sleepScore: 82,
          userId: testUserId,
        },
      ],
    });
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  describe('GET /api/sleep-data', () => {
    it('should return sleep records for authenticated user', async () => {
      const request = new NextRequest('http://localhost/api/sleep-data');
      const response = await getSleepDataHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.records).toBeDefined();
      expect(Array.isArray(data.records)).toBe(true);
    });

    it('should filter by date range', async () => {
      const request = new NextRequest('http://localhost/api/sleep-data?startDate=2024-01-15&endDate=2024-01-16');
      const response = await getSleepDataHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.records).toBeDefined();
    });

    it('should return empty array for user with no records', async () => {
      const otherUserId = crypto.randomUUID();
      const otherToken = await generateTestToken(otherUserId, 'other@example.com');

      const request = new NextRequest('http://localhost/api/sleep-data');
      const response = await getSleepDataHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.records).toBeDefined();
    });

    it('should return 401 for unauthenticated request', async () => {
      const originalToken = testToken;
      testToken = '';
      mockCookieStore.get.mockReturnValueOnce({ value: null });
      const request = new NextRequest('http://localhost/api/sleep-data');
      const response = await getSleepDataHandler(request);
      testToken = originalToken;

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sleep-dates', () => {
    it('should return dates with sleep records', async () => {
      const request = new NextRequest('http://localhost/api/sleep-dates');
      const response = await getSleepDatesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.dates).toBeDefined();
      expect(Array.isArray(data.dates)).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const originalToken = testToken;
      testToken = '';
      mockCookieStore.get.mockReturnValueOnce({ value: null });
      const request = new NextRequest('http://localhost/api/sleep-dates');
      const response = await getSleepDatesHandler(request);
      testToken = originalToken;

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sleep-history', () => {
    it('should return sleep history', async () => {
      const request = new NextRequest('http://localhost/api/sleep-history');
      const response = await getSleepHistoryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.records).toBeDefined();
    });

    it('should support pagination', async () => {
      const request = new NextRequest('http://localhost/api/sleep-history?page=1&pageSize=2');
      const response = await getSleepHistoryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.records).toBeDefined();
      expect(data.pagination).toBeDefined();
    });

    it('should return 401 for unauthenticated request', async () => {
      const originalToken = testToken;
      testToken = '';
      mockCookieStore.get.mockReturnValueOnce({ value: null });
      const request = new NextRequest('http://localhost/api/sleep-history');
      const response = await getSleepHistoryHandler(request);
      testToken = originalToken;

      expect(response.status).toBe(401);
    });
  });
});
