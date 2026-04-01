// __test__/setup.ts
// Unit test setup - only sets environment variables, no database

import '@testing-library/jest-dom';

// Set environment variables for unit tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'
process.env.XFYUN_API_KEY = 'test-api-key'
