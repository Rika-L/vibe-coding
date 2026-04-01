import { createOpenAI } from '@ai-sdk/openai';

const xfyunProvider = createOpenAI({
  apiKey: process.env.XFYUN_API_KEY,
  baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
});

// 使用 .chat() 显式指定 Chat Completions API（而非默认的 Responses API）
export const xfyun = (modelId: string) => xfyunProvider.chat(modelId);
