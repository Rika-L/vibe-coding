import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Create mock functions outside
const mockCreate = vi.fn()

// Use a class constructor for proper mocking
class MockOpenAI {
  chat = {
    completions: {
      create: mockCreate
    }
  }
}

vi.mock('openai', () => {
  return {
    default: MockOpenAI
  }
})

// Stub environment variables
vi.stubEnv('XFYUN_API_KEY', 'test-api-key')

// Import after mocking
const { generateSleepAnalysis, aiModel } = await import('@/lib/ai')

describe('ai service', () => {
  beforeEach(() => {
    // 设置默认成功响应
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: '这是 AI 分析结果'
          }
        }
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('generateSleepAnalysis', () => {
    it('should return AI analysis result', async () => {
      const prompt = '分析我的睡眠数据'
      const result = await generateSleepAnalysis(prompt)

      expect(result).toBe('这是 AI 分析结果')
    })

    it('should be available through aiModel.generate', async () => {
      const prompt = '分析我的睡眠数据'
      const result = await aiModel.generate(prompt)

      expect(result).toBe('这是 AI 分析结果')
    })

    it('should return empty string when AI returns no content', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }]
      })

      const prompt = '分析我的睡眠数据'
      const result = await generateSleepAnalysis(prompt)

      expect(result).toBe('')
    })

    it('should throw on non-retryable error', async () => {
      mockCreate.mockRejectedValue(new Error('Invalid API key'))

      const prompt = '分析我的睡眠数据'

      await expect(generateSleepAnalysis(prompt)).rejects.toThrow('Invalid API key')
    })
  })
})
