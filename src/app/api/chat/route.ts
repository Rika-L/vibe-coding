import { streamText, type UIMessage } from 'ai';
import { xfyun } from '@/lib/ai-provider';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const SYSTEM_PROMPT = `你是一位专业的睡眠健康专家，擅长分析睡眠数据并提供改善建议。请用中文回答，回答要专业但通俗易懂。

你可以帮助用户：
1. 解答关于睡眠健康的疑问
2. 提供改善睡眠质量的建议
3. 分析睡眠数据背后的含义
4. 推荐健康的睡眠习惯

请保持友善、专业的态度，给出实用可行的建议。`;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: '未登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { messages, conversationId } = body as { messages: UIMessage[]; conversationId: string };

    if (!conversationId) {
      return new Response(JSON.stringify({ error: '缺少对话ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 验证对话归属
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.userId,
      },
    });

    if (!conversation) {
      return new Response(JSON.stringify({ error: '对话不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 保存用户消息
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      // Extract text content from parts
      const content = lastMessage.parts
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map(part => part.text)
        .join('');

      await prisma.message.create({
        data: {
          role: 'user',
          content,
          conversationId,
        },
      });
    }

    // 转换消息格式为简单字符串格式
    const simpleMessages = messages.map(m => ({
      role: m.role,
      content: m.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map(p => p.text)
        .join(''),
    }));

    const result = streamText({
      model: xfyun('astron-code-latest'),
      system: SYSTEM_PROMPT,
      messages: simpleMessages,
      onFinish: async ({ text }) => {
        // 保存 AI 回复
        await prisma.message.create({
          data: {
            role: 'assistant',
            content: text,
            conversationId,
          },
        });

        // 更新对话时间
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
      },
    });

    return result.toUIMessageStreamResponse();
  }
  catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: '聊天请求失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
