// __test__/integration/api/user.test.ts
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

// Track created users for cleanup
const createdUserIds: string[] = [];
let testUserId: string;
let testUserEmail: string;
let testToken: string;

// Mock next/headers for cookies functionality
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

// Dynamic import of route handlers after mocks are in place
const { GET: getProfileHandler, PUT: updateProfileHandler } = await import('@/app/api/user/profile/route');
const { PUT: changePasswordHandler } = await import('@/app/api/user/password/route');

// Helper to create a mock NextRequest with JSON body
function createRequest(url: string, body: Record<string, unknown>, method: string = 'POST'): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Helper to create a GET request
function createGetRequest(url: string): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
  });
}

// Helper to generate unique email for each test
function uniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    // Create a test user for tests
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword('password123');
    const user = await testPrisma.user.create({
      data: {
        email: 'usertest@test.com',
        password: hashedPassword,
        name: 'User Test User',
        avatar: null,
      },
    });
    testUserId = user.id;
    testUserEmail = user.email;
    testToken = await generateTestToken(user.id, user.email);
    createdUserIds.push(user.id);
  });

  afterEach(async () => {
    // Clean up test users created during tests
    if (createdUserIds.length > 1) {
      try {
        await testPrisma.user.deleteMany({
          where: {
            id: { in: createdUserIds.slice(1) },
          },
        });
      }
      catch {
        // Ignore cleanup errors
      }
      createdUserIds.length = 1;
    }
    vi.clearAllMocks();
  });

  describe('GET /api/user/profile', () => {
    it('should reject unauthenticated requests', async () => {
      // Clear the token to simulate unauthenticated request
      const originalToken = testToken;
      testToken = '';

      const request = createGetRequest('http://localhost:3000/api/user/profile');
      const response = await getProfileHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');

      // Restore token
      testToken = originalToken;
    });

    it('should return user profile for authenticated requests', async () => {
      const request = createGetRequest('http://localhost:3000/api/user/profile');
      const response = await getProfileHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(testUserId);
      expect(data.user.email).toBe(testUserEmail);
      expect(data.user.name).toBe('User Test User');
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user name successfully', async () => {
      const request = createRequest(
        'http://localhost:3000/api/user/profile',
        { name: 'Updated Name' },
        'PUT',
      );

      const response = await updateProfileHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.name).toBe('Updated Name');

      // Verify the change persisted
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: testUserId },
        select: { name: true },
      });
      expect(updatedUser?.name).toBe('Updated Name');
    });

    it('should update user avatar successfully', async () => {
      const newAvatar = 'https://example.com/new-avatar.png';
      const request = createRequest(
        'http://localhost:3000/api/user/profile',
        { avatar: newAvatar },
        'PUT',
      );

      const response = await updateProfileHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.avatar).toBe(newAvatar);
    });

    it('should reject name longer than 50 characters', async () => {
      const longName = 'a'.repeat(51);
      const request = createRequest(
        'http://localhost:3000/api/user/profile',
        { name: longName },
        'PUT',
      );

      const response = await updateProfileHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('名称过长');
    });

    it('should reject unauthenticated requests', async () => {
      const originalToken = testToken;
      testToken = '';

      const request = createRequest(
        'http://localhost:3000/api/user/profile',
        { name: 'New Name' },
        'PUT',
      );

      const response = await updateProfileHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');

      testToken = originalToken;
    });
  });

  describe('PUT /api/user/password', () => {
    it('should change password with correct current password', async () => {
      const request = createRequest(
        'http://localhost:3000/api/user/password',
        { currentPassword: 'password123', newPassword: 'newPassword456' },
        'PUT',
      );

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify we can login with new password
      const { verifyPassword } = await import('@/lib/auth');
      const user = await testPrisma.user.findUnique({
        where: { id: testUserId },
        select: { password: true },
      });
      const isValid = await verifyPassword('newPassword456', user!.password);
      expect(isValid).toBe(true);

      // Reset password for other tests
      const { hashPassword } = await import('@/lib/auth');
      const hashedPassword = await hashPassword('password123');
      await testPrisma.user.update({
        where: { id: testUserId },
        data: { password: hashedPassword },
      });
    });

    it('should reject wrong current password', async () => {
      const request = createRequest(
        'http://localhost:3000/api/user/password',
        { currentPassword: 'wrongPassword', newPassword: 'newPassword456' },
        'PUT',
      );

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('当前密码错误');
    });

    it('should reject short new password', async () => {
      const request = createRequest(
        'http://localhost:3000/api/user/password',
        { currentPassword: 'password123', newPassword: '12345' },
        'PUT',
      );

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('密码至少6位');
    });

    it('should reject missing fields', async () => {
      const request = createRequest(
        'http://localhost:3000/api/user/password',
        { currentPassword: 'password123' },
        'PUT',
      );

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('请填写所有字段');
    });

    it('should reject unauthenticated requests', async () => {
      const originalToken = testToken;
      testToken = '';

      const request = createRequest(
        'http://localhost:3000/api/user/password',
        { currentPassword: 'password123', newPassword: 'newPassword456' },
        'PUT',
      );

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');

      testToken = originalToken;
    });
  });
});
