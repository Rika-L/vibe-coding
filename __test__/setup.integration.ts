// __test__/setup.integration.ts
// Integration test setup - sets up test database with SQLite
import { beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import fs from 'fs';

const testDbPath = join(process.cwd(), 'prisma', 'test.db');

// Set environment variables immediately (before any modules are imported)
process.env.DATABASE_URL = `file:${testDbPath}`;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.XFYUN_API_KEY = 'test-api-key';

beforeAll(async () => {
  // Ensure prisma directory exists
  const prismaDir = join(process.cwd(), 'prisma');
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
  }

  // Remove existing test database to start fresh
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath);
    }
    catch {
      // Ignore errors
    }
  }

  // Copy test schema to main schema temporarily for migration
  const mainSchemaPath = join(prismaDir, 'schema.prisma');
  const testSchemaPath = join(prismaDir, 'schema.test.prisma');
  const backupSchemaPath = join(prismaDir, 'schema.prisma.backup');

  // Backup main schema if not already backed up
  if (!fs.existsSync(backupSchemaPath)) {
    fs.copyFileSync(mainSchemaPath, backupSchemaPath);
  }

  // Copy test schema as main schema for migration
  fs.copyFileSync(testSchemaPath, mainSchemaPath);

  try {
    // Generate client and push schema for SQLite
    execSync('npx prisma generate', { stdio: 'pipe', timeout: 60000 });
    execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe', timeout: 30000 });
  }
  finally {
    // Restore main schema
    fs.copyFileSync(backupSchemaPath, mainSchemaPath);
  }
}, 120000);

afterAll(async () => {
  // Clean up test database only after all tests complete
  // Small delay to ensure all connections are closed
  await new Promise(resolve => setTimeout(resolve, 100));

  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath);
    }
    catch {
      // Ignore cleanup errors on Windows/WSL
    }
  }
});
