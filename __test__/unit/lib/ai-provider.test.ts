import { describe, it, expect, vi } from 'vitest'

// Mock @ai-sdk/openai
const mockChat = vi.fn()

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn().mockReturnValue({
    chat: mockChat,
  }),
}))

// Stub environment variables
vi.stubEnv('XFYUN_API_KEY', 'test-api-key')

// Import after mocking
const { xfyun } = await import('@/lib/ai-provider')

describe('ai-provider', () => {
  it('should create xfyun provider with chat method', () => {
    const modelId = 'test-model'
    xfyun(modelId)

    expect(mockChat).toHaveBeenCalledWith(modelId)
  })
})
