// __test__/integration/api/reports.test.ts
import { describe, it, expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
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

// Mock next/headers for cookies functionality
let currentToken: string | null = null;

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn((name: string) => {
    if (name === 'auth-token' && currentToken) {
      return { value: currentToken };
    }
    return { value: null };
  }),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}));

// Dynamic import of route handlers after mocks are in place
const { GET: getReportsHandler } = await import('@/app/api/reports/route');
const { GET: getReportByIdHandler, DELETE: deleteReportHandler } = await import('@/app/api/reports/[id]/route');

// Test data
let testUserId: string;
let testUserEmail: string;
let testToken: string;
let testReportId: string;
let otherUserId: string;
let otherUserToken: string;

// Helper to generate unique email for each test
function uniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

describe('Reports API Integration Tests', () => {
  beforeAll(async () => {
    // Create test users
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword('password123');

    const user = await testPrisma.user.create({
      data: {
        email: 'reportstest@test.com',
        password: hashedPassword,
        name: 'Reports Test User',
      },
    });
    testUserId = user.id;
    testUserEmail = user.email;
    testToken = await generateTestToken(user.id, user.email);

    const otherUser = await testPrisma.user.create({
      data: {
        email: uniqueEmail('other'),
        password: hashedPassword,
        name: 'Other User',
      },
    });
    otherUserId = otherUser.id;
    otherUserToken = await generateTestToken(otherUser.id, otherUser.email);

    // Create test reports for the main test user
    const report = await testPrisma.analysisReport.create({
      data: {
        title: 'Test Report 1',
        summary: 'Test summary',
        suggestions: 'Test suggestions',
        sleepQuality: 'Good',
        dataRange: '2024-01-01 to 2024-01-07',
        userId: testUserId,
      },
    });
    testReportId = report.id;

    // Create additional reports for pagination testing
    for (let i = 2; i <= 15; i++) {
      await testPrisma.analysisReport.create({
        data: {
          title: `Test Report ${i}`,
          summary: `Summary ${i}`,
          suggestions: `Suggestions ${i}`,
          sleepQuality: 'Good',
          dataRange: '2024-01-01 to 2024-01-07',
          userId: testUserId,
        },
      });
    }

    // Create a report for the other user
    await testPrisma.analysisReport.create({
      data: {
        title: 'Other User Report',
        summary: 'Other summary',
        suggestions: 'Other suggestions',
        sleepQuality: 'Poor',
        dataRange: '2024-01-01 to 2024-01-07',
        userId: otherUserId,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await testPrisma.analysisReport.deleteMany({});
    await testPrisma.user.deleteMany({});
    await testPrisma.$disconnect();
  });

  afterEach(() => {
    vi.clearAllMocks();
    currentToken = null;
  });

  describe('GET /api/reports', () => {
    it('should reject unauthenticated requests', async () => {
      currentToken = null;
      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await getReportsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');
    });

    it('should return reports list for authenticated user', async () => {
      currentToken = testToken;
      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await getReportsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toBeDefined();
      expect(Array.isArray(data.reports)).toBe(true);
      expect(data.reports.length).toBeGreaterThan(0);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.pageSize).toBe(10);
      expect(data.pagination.total).toBe(15);
      expect(data.pagination.totalPages).toBe(2);
    });

    it('should support pagination', async () => {
      currentToken = testToken;
      const request = new NextRequest('http://localhost:3000/api/reports?page=2&pageSize=5');
      const response = await getReportsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports.length).toBe(5);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.pageSize).toBe(5);
      expect(data.pagination.total).toBe(15);
      expect(data.pagination.totalPages).toBe(3);
    });

    it('should only return reports belonging to the authenticated user', async () => {
      currentToken = testToken;
      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await getReportsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // All reports should belong to the test user
      for (const report of data.reports) {
        expect(report.userId).toBe(testUserId);
      }
    });
  });

  describe('GET /api/reports/[id]', () => {
    it('should return report details', async () => {
      const request = new NextRequest(`http://localhost:3000/api/reports/${testReportId}`);
      const response = await getReportByIdHandler(request, {
        params: Promise.resolve({ id: testReportId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.report).toBeDefined();
      expect(data.report.id).toBe(testReportId);
      expect(data.report.title).toBe('Test Report 1');
      expect(data.report.summary).toBe('Test summary');
    });

    it('should return 404 for non-existent report', async () => {
      const fakeId = 'non-existent-id';
      const request = new NextRequest(`http://localhost:3000/api/reports/${fakeId}`);
      const response = await getReportByIdHandler(request, {
        params: Promise.resolve({ id: fakeId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Report not found');
    });
  });

  describe('DELETE /api/reports/[id]', () => {
    it('should reject unauthenticated requests', async () => {
      currentToken = null;
      const request = new NextRequest(`http://localhost:3000/api/reports/${testReportId}`, {
        method: 'DELETE',
      });
      const response = await deleteReportHandler(request, {
        params: Promise.resolve({ id: testReportId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');
    });

    it('should delete own report successfully', async () => {
      // Create a new report for this test
      const report = await testPrisma.analysisReport.create({
        data: {
          title: 'Report to Delete',
          summary: 'Will be deleted',
          suggestions: 'Delete suggestions',
          sleepQuality: 'Average',
          dataRange: '2024-01-01 to 2024-01-07',
          userId: testUserId,
        },
      });

      currentToken = testToken;
      const request = new NextRequest(`http://localhost:3000/api/reports/${report.id}`, {
        method: 'DELETE',
      });
      const response = await deleteReportHandler(request, {
        params: Promise.resolve({ id: report.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('删除成功');

      // Verify report is deleted
      const deletedReport = await testPrisma.analysisReport.findUnique({
        where: { id: report.id },
      });
      expect(deletedReport).toBeNull();
    });

    it('should return 404 for non-existent report', async () => {
      currentToken = testToken;
      const fakeId = 'non-existent-id';
      const request = new NextRequest(`http://localhost:3000/api/reports/${fakeId}`, {
        method: 'DELETE',
      });
      const response = await deleteReportHandler(request, {
        params: Promise.resolve({ id: fakeId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('报告不存在');
    });

    it('should reject deleting other user\'s report', async () => {
      // Get the other user's report
      const otherReport = await testPrisma.analysisReport.findFirst({
        where: { userId: otherUserId },
      });

      if (!otherReport) {
        throw new Error('Other user report not found');
      }

      currentToken = testToken;
      const request = new NextRequest(`http://localhost:3000/api/reports/${otherReport.id}`, {
        method: 'DELETE',
      });
      const response = await deleteReportHandler(request, {
        params: Promise.resolve({ id: otherReport.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('无权删除此报告');

      // Verify report still exists
      const stillExists = await testPrisma.analysisReport.findUnique({
        where: { id: otherReport.id },
      });
      expect(stillExists).not.toBeNull();
    });
  });
});
