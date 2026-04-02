import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 },
      );
    }

    return NextResponse.json({ user: dbUser });
  }
  catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, avatar } = body;

    if (name && name.length > 50) {
      return NextResponse.json(
        { error: '名称过长' },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: { name, avatar },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  }
  catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 },
    );
  }
}
