import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const report = await prisma.analysisReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ report });
  }
  catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;

    const report = await prisma.analysisReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 },
      );
    }

    if (report.userId !== user.userId) {
      return NextResponse.json(
        { error: '无权删除此报告' },
        { status: 403 },
      );
    }

    await prisma.analysisReport.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  }
  catch (error) {
    console.error('Failed to delete report:', error);
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 },
    );
  }
}
