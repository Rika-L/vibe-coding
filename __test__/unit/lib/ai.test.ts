import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock OpenAI before importing ai module
const mockCreate = vi.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: '这是 AI 分析结果'
      }
    }
  ]
})

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
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('generateSleepAnalysis', () => {
    it('should return AI analysis result', async () => {
      const prompt = '分析我的睡眠数据'
      const resultPromise = generateSleepAnalysis(prompt)

      // Flush all pending timers/promises
      await vi.runAllTimersAsync()

      const result = await resultPromise

      expect(result).toBe('这是 AI 分析结果')
    })

    it('should be available through aiModel.generate', async () => {
      const prompt = '分析我的睡眠数据'
      const resultPromise = aiModel.generate(prompt)

      // Flush all pending timers/promises
      await vi.runAllTimersAsync()

      const result = await resultPromise

      expect(result).toBe('这是 AI 分析结果')
    })
  })
})
