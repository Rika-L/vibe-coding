import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock functions outside
const mockCreate = vi.fn();

// Use a class constructor for proper mocking
class MockOpenAI {
  chat = {
    completions: {
      create: mockCreate,
    },
  };
}

vi.mock('openai', () => {
  return {
    default: MockOpenAI,
  };
});

// Stub environment variables
vi.stubEnv('XFYUN_API_KEY', 'test-api-key');

// Import after mocking
const { generateSleepAnalysis, aiModel } = await import('@/lib/ai');

describe('ai service', () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultSuccessResponse = {
    choices: [
      {
        message: {
          content: '这是 AI 分析结果',
        },
      },
    ],
  };

  describe('generateSleepAnalysis', () => {
    it('should return AI analysis result', async () => {
      mockCreate.mockResolvedValue(defaultSuccessResponse);

      const prompt = '分析我的睡眠数据';
      const result = await generateSleepAnalysis(prompt);

      expect(result).toBe('这是 AI 分析结果');
    });

    it('should be available through aiModel.generate', async () => {
      mockCreate.mockResolvedValue(defaultSuccessResponse);

      const prompt = '分析我的睡眠数据';
      const result = await aiModel.generate(prompt);

      expect(result).toBe('这是 AI 分析结果');
    });

    it('should return empty string when AI returns no content', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const prompt = '分析我的睡眠数据';
      const result = await generateSleepAnalysis(prompt);

      expect(result).toBe('');
    });

    it('should throw on non-retryable error', async () => {
      mockCreate.mockRejectedValue(new Error('Invalid API key'));

      const prompt = '分析我的睡眠数据';

      await expect(generateSleepAnalysis(prompt)).rejects.toThrow('Invalid API key');
    });

    it('should retry on timeout error', async () => {
      // 使用真正的 Error 来确保 instanceof 检查通过
      mockCreate
        .mockRejectedValueOnce(new Error('timeout error'))
        .mockResolvedValueOnce({
          choices: [{ message: { content: '重试后成功' } }],
        });

      const prompt = '分析我的睡眠数据';
      const result = await generateSleepAnalysis(prompt);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result).toBe('重试后成功');
    });

    it('should retry on network error', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValueOnce({
          choices: [{ message: { content: '网络错误后重试成功' } }],
        });

      const prompt = '分析我的睡眠数据';
      const result = await generateSleepAnalysis(prompt);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result).toBe('网络错误后重试成功');
    });

    it('should retry on 503 service unavailable', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('503 Service Unavailable'))
        .mockResolvedValueOnce({
          choices: [{ message: { content: '服务恢复后成功' } }],
        });

      const prompt = '分析我的睡眠数据';
      const result = await generateSleepAnalysis(prompt);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result).toBe('服务恢复后成功');
    });

    it('should retry on rate limit (429)', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('429 Too Many Requests'))
        .mockResolvedValueOnce({
          choices: [{ message: { content: '限流后重试成功' } }],
        });

      const prompt = '分析我的睡眠数据';
      const result = await generateSleepAnalysis(prompt);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result).toBe('限流后重试成功');
    });

    it('should retry on ECONNRESET error', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce({
          choices: [{ message: { content: '连接重置后成功' } }],
        });

      const prompt = '分析我的睡眠数据';
      const result = await generateSleepAnalysis(prompt);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result).toBe('连接重置后成功');
    });

    it('should throw after max retries on retryable errors', async () => {
      // 连续三次超时错误
      mockCreate
        .mockRejectedValueOnce(new Error('timeout error'))
        .mockRejectedValueOnce(new Error('timeout error'))
        .mockRejectedValueOnce(new Error('timeout error'));

      const prompt = '分析我的睡眠数据';

      await expect(generateSleepAnalysis(prompt)).rejects.toThrow('timeout error');
      expect(mockCreate).toHaveBeenCalledTimes(3); // MAX_RETRIES = 3
    });

    it('should handle non-Error objects as errors', async () => {
      mockCreate.mockRejectedValue('string error');

      const prompt = '分析我的睡眠数据';

      await expect(generateSleepAnalysis(prompt)).rejects.toThrow();
    });

    it('should return empty string for empty content in choices', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '' } }],
      });

      const prompt = '分析我的睡眠数据';
      const result = await generateSleepAnalysis(prompt);

      expect(result).toBe('');
    });

    it('should return empty string when choices is empty', async () => {
      mockCreate.mockResolvedValue({
        choices: [],
      });

      const prompt = '分析我的睡眠数据';
      const result = await generateSleepAnalysis(prompt);

      expect(result).toBe('');
    });
  });
});
