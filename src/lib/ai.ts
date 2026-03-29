import OpenAI from "openai";

// 讯飞星火模型配置
const xfyunClient = new OpenAI({
  apiKey: process.env.XFYUN_API_KEY || "",
  baseURL: "https://maas-api.cn-huabei-1.xf-yun.com/v2",
});

// 模型 ID 映射
const MODEL_ID = "xdeepseekv3"; // 讯飞 DeepSeek V3 模型

export async function generateSleepAnalysis(prompt: string): Promise<string> {
  try {
    const response = await xfyunClient.chat.completions.create({
      model: MODEL_ID,
      messages: [
        {
          role: "system",
          content: "你是一位专业的睡眠健康专家，擅长分析睡眠数据并提供改善建议。请用中文回答。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("讯飞 API 调用失败:", error);
    throw error;
  }
}

// 兼容原有接口
export const aiModel = {
  generate: generateSleepAnalysis,
};
