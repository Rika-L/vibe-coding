// __test__/integration/api/conversations.test.ts
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

// Track created resources for cleanup
const createdUserIds: string[] = [];
const createdConversationIds: string[] = [];
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
const { GET: getConversations, POST: createConversation } = await import('@/app/api/conversations/route');
const { GET: getConversationById, DELETE: deleteConversation } = await import('@/app/api/conversations/[id]/route');

// Helper to create a mock NextRequest with JSON body
function createRequest(url: string, options: {
  method?: string;
  body?: Record<string, unknown>;
}): NextRequest {
  return new NextRequest(url, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : {},
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

// Helper to generate unique email for each test
function uniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

describe('Conversations API Integration Tests', () => {
  beforeAll(async () => {
    // Create a test user for conversations tests
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword('password123');
    const user = await testPrisma.user.create({
      data: {
        email: 'convtest@test.com',
        password: hashedPassword,
        name: 'Conversation Test User',
      },
    });
    testUserId = user.id;
    testUserEmail = user.email;
    testToken = await generateTestToken(user.id, user.email);
    createdUserIds.push(user.id);
  });

  afterEach(async () => {
    // Clean up conversations created during tests
    if (createdConversationIds.length > 0) {
      try {
        await testPrisma.conversation.deleteMany({
          where: {
            id: { in: createdConversationIds },
          },
        });
      }
      catch {
        // Ignore cleanup errors
      }
      createdConversationIds.length = 0;
    }
    vi.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up test user
    try {
      await testPrisma.conversation.deleteMany({
        where: { userId: testUserId },
      });
      await testPrisma.user.delete({
        where: { id: testUserId },
      });
    }
    catch {
      // Ignore cleanup errors
    }
    await testPrisma.$disconnect();
  });

  describe('GET /api/conversations', () => {
    it('should reject unauthenticated requests', async () => {
      // Clear the token to simulate unauthenticated request
      const originalToken = testToken;
      testToken = '';

      const request = createRequest('http://localhost:3000/api/conversations', {});
      const response = await getConversations(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('未登录');

      // Restore token
      testToken = originalToken;
    });

    it('should return conversations list for authenticated user', async () => {
      // Create a test conversation
      const conversation = await testPrisma.conversation.create({
        data: {
          title: 'Test Conversation',
          userId: testUserId,
        },
      });
      createdConversationIds.push(conversation.id);

      const request = createRequest('http://localhost:3000/api/conversations', {});
      const response = await getConversations(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.conversations).toBeDefined();
      expect(Array.isArray(data.conversations)).toBe(true);
      expect(data.conversations.length).toBeGreaterThan(0);
      expect(data.conversations[0].title).toBe('Test Conversation');
    });

    it('should return empty array when user has no conversations', async () => {
      // Create a new user with no conversations
      const { hashPassword } = await import('@/lib/auth');
      const hashedPassword = await hashPassword('password123');
      const newUser = await testPrisma.user.create({
        data: {
          email: uniqueEmail('noconv'),
          password: hashedPassword,
          name: 'No Conversations User',
        },
      });
      createdUserIds.push(newUser.id);

      // Set token for new user
      const originalToken = testToken;
      testToken = await generateTestToken(newUser.id, newUser.email);

      const request = createRequest('http://localhost:3000/api/conversations', {});
      const response = await getConversations(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.conversations).toBeDefined();
      expect(Array.isArray(data.conversations)).toBe(true);
      expect(data.conversations.length).toBe(0);

      // Restore original token
      testToken = originalToken;
    });
  });

  describe('POST /api/conversations', () => {
    it('should reject unauthenticated requests', async () => {
      const originalToken = testToken;
      testToken = '';

      const request = createRequest('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: { title: 'New Conversation' },
      });
      const response = await createConversation(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('未登录');

      testToken = originalToken;
    });

    it('should create a new conversation with custom title', async () => {
      const request = createRequest('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: { title: 'My Custom Title' },
      });
      const response = await createConversation(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.conversation).toBeDefined();
      expect(data.conversation.title).toBe('My Custom Title');
      expect(data.conversation.userId).toBe(testUserId);

      createdConversationIds.push(data.conversation.id);
    });

    it('should create a new conversation with default title', async () => {
      const request = createRequest('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: {},
      });
      const response = await createConversation(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.conversation).toBeDefined();
      expect(data.conversation.title).toBe('新对话');
      expect(data.conversation.userId).toBe(testUserId);

      createdConversationIds.push(data.conversation.id);
    });
  });

  describe('GET /api/conversations/[id]', () => {
    it('should reject unauthenticated requests', async () => {
      const originalToken = testToken;
      testToken = '';

      const request = createRequest('http://localhost:3000/api/conversations/some-id', {});
      const response = await getConversationById(request, {
        params: Promise.resolve({ id: 'some-id' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('未登录');

      testToken = originalToken;
    });

    it('should return conversation details with messages', async () => {
      // Create a test conversation with messages
      const conversation = await testPrisma.conversation.create({
        data: {
          title: 'Detail Test Conversation',
          userId: testUserId,
        },
      });
      createdConversationIds.push(conversation.id);

      // Add a message
      await testPrisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: 'Hello, this is a test message',
        },
      });

      const request = createRequest(`http://localhost:3000/api/conversations/${conversation.id}`, {});
      const response = await getConversationById(request, {
        params: Promise.resolve({ id: conversation.id }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.conversation).toBeDefined();
      expect(data.conversation.id).toBe(conversation.id);
      expect(data.conversation.title).toBe('Detail Test Conversation');
      expect(data.conversation.messages).toBeDefined();
      expect(Array.isArray(data.conversation.messages)).toBe(true);
      expect(data.conversation.messages.length).toBe(1);
      expect(data.conversation.messages[0].content).toBe('Hello, this is a test message');
    });

    it('should return 404 for non-existent conversation', async () => {
      const fakeId = 'non-existent-id';
      const request = createRequest(`http://localhost:3000/api/conversations/${fakeId}`, {});
      const response = await getConversationById(request, {
        params: Promise.resolve({ id: fakeId }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('对话不存在');
    });

    it('should return 404 for conversation belonging to another user', async () => {
      // Create another user
      const { hashPassword } = await import('@/lib/auth');
      const hashedPassword = await hashPassword('password123');
      const otherUser = await testPrisma.user.create({
        data: {
          email: uniqueEmail('other'),
          password: hashedPassword,
          name: 'Other User',
        },
      });
      createdUserIds.push(otherUser.id);

      // Create a conversation for the other user
      const conversation = await testPrisma.conversation.create({
        data: {
          title: 'Other User Conversation',
          userId: otherUser.id,
        },
      });
      createdConversationIds.push(conversation.id);

      // Try to access with test user
      const request = createRequest(`http://localhost:3000/api/conversations/${conversation.id}`, {});
      const response = await getConversationById(request, {
        params: Promise.resolve({ id: conversation.id }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('对话不存在');
    });
  });

  describe('DELETE /api/conversations/[id]', () => {
    it('should reject unauthenticated requests', async () => {
      const originalToken = testToken;
      testToken = '';

      const request = createRequest('http://localhost:3000/api/conversations/some-id', {
        method: 'DELETE',
      });
      const response = await deleteConversation(request, {
        params: Promise.resolve({ id: 'some-id' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('未登录');

      testToken = originalToken;
    });

    it('should delete an existing conversation', async () => {
      // Create a test conversation
      const conversation = await testPrisma.conversation.create({
        data: {
          title: 'To Be Deleted',
          userId: testUserId,
        },
      });

      const request = createRequest(`http://localhost:3000/api/conversations/${conversation.id}`, {
        method: 'DELETE',
      });
      const response = await deleteConversation(request, {
        params: Promise.resolve({ id: conversation.id }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify it's deleted
      const found = await testPrisma.conversation.findUnique({
        where: { id: conversation.id },
      });
      expect(found).toBeNull();
    });

    it('should return 404 for non-existent conversation', async () => {
      const fakeId = 'non-existent-id';
      const request = createRequest(`http://localhost:3000/api/conversations/${fakeId}`, {
        method: 'DELETE',
      });
      const response = await deleteConversation(request, {
        params: Promise.resolve({ id: fakeId }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('对话不存在');
    });

    it('should return 404 when trying to delete another user\'s conversation', async () => {
      // Create another user
      const { hashPassword } = await import('@/lib/auth');
      const hashedPassword = await hashPassword('password123');
      const otherUser = await testPrisma.user.create({
        data: {
          email: uniqueEmail('other'),
          password: hashedPassword,
          name: 'Other User',
        },
      });
      createdUserIds.push(otherUser.id);

      // Create a conversation for the other user
      const conversation = await testPrisma.conversation.create({
        data: {
          title: 'Other User Conversation',
          userId: otherUser.id,
        },
      });
      createdConversationIds.push(conversation.id);

      // Try to delete with test user
      const request = createRequest(`http://localhost:3000/api/conversations/${conversation.id}`, {
        method: 'DELETE',
      });
      const response = await deleteConversation(request, {
        params: Promise.resolve({ id: conversation.id }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('对话不存在');

      // Verify it still exists
      const found = await testPrisma.conversation.findUnique({
        where: { id: conversation.id },
      });
      expect(found).not.toBeNull();
    });
  });
});
