import { createOpenAI } from '@ai-sdk/openai'

export const xfyun = createOpenAI({
  apiKey: process.env.XFYUN_API_KEY,
  baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
})
