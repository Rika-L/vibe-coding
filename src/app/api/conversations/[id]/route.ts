import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 获取对话详情（含消息）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: '对话不存在' }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  }
  catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: '获取对话失败' }, { status: 500 });
  }
}

// 删除对话
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;

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

    await prisma.conversation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  }
  catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json({ error: '删除对话失败' }, { status: 500 });
  }
}

// 更新对话（重命名）
export async function PUT(
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

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
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
    console.error('Update conversation error:', error);
    return NextResponse.json({ error: '更新对话失败' }, { status: 500 });
  }
}
