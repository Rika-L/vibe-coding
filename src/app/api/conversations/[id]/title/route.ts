import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 更新对话标题
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }

    // 验证对话归属
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: '对话不存在' }, { status: 404 });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { title: title.trim() },
    });

    return NextResponse.json({ conversation: updated });
  }
  catch (error) {
    console.error('Update conversation title error:', error);
    return NextResponse.json({ error: '更新标题失败' }, { status: 500 });
  }
}
