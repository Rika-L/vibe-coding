import OpenAI from 'openai';

// 讯飞星火模型配置
const xfyunClient = new OpenAI({
  apiKey: process.env.XFYUN_API_KEY || '',
  baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
});

// 模型 ID 映射
const MODEL_ID = 'astron-code-latest'; // 讯飞 DeepSeek V3 模型

// AI 请求超时时间 (毫秒)
const AI_TIMEOUT = 60000;

// 重试配置
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 秒
const MAX_DELAY = 10000; // 10 秒

// 带超时的 AI 请求包装器
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`AI 请求超时 (${ms / 1000}秒)`)), ms),
    ),
  ]);
}

// 指数退避延迟
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 判断是否为可重试的错误
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // 网络错误、超时、服务端错误可重试
    return (
      message.includes('timeout')
      || message.includes('network')
      || message.includes('econnrefused')
      || message.includes('econnreset')
      || message.includes('503')
      || message.includes('502')
      || message.includes('429') // rate limit
    );
  }
  return false;
}

export async function generateSleepAnalysis(prompt: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await withTimeout(
        xfyunClient.chat.completions.create({
          model: MODEL_ID,
          messages: [
            {
              role: 'system',
              content: '你是一位专业的睡眠健康专家，擅长分析睡眠数据并提供改善建议。请用中文回答。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
        AI_TIMEOUT,
      );

      return response.choices[0]?.message?.content || '';
    }
    catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`讯飞 API 调用失败 (尝试 ${attempt}/${MAX_RETRIES}):`, error);

      // 如果不是可重试的错误或已是最后一次尝试，直接抛出
      if (!isRetryableError(error) || attempt === MAX_RETRIES) {
        throw lastError;
      }

      // 计算指数退避延迟
      const backoffDelay = Math.min(
        INITIAL_DELAY * Math.pow(2, attempt - 1),
        MAX_DELAY,
      );
      console.log(`等待 ${backoffDelay}ms 后重试...`);
      await delay(backoffDelay);
    }
  }

  throw lastError || new Error('AI 请求失败');
}

// 兼容原有接口
export const aiModel = {
  generate: generateSleepAnalysis,
};
