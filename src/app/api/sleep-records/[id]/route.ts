import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;

    const record = await prisma.sleepRecord.findFirst({
      where: { id, userId: user.userId },
    });

    if (!record) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Get sleep record error:", error);
    return NextResponse.json({ error: "获取记录失败" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // 检查记录是否存在且属于当前用户
    const existingRecord = await prisma.sleepRecord.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    const {
      date,
      sleepDuration,
      bedTime,
      wakeTime,
      deepSleep,
      lightSleep,
      remSleep,
      awakeCount,
      sleepScore,
      heartRate,
    } = body;

    // 验证数据范围
    if (sleepDuration !== undefined && sleepDuration <= 0) {
      return NextResponse.json(
        { error: "睡眠时长必须大于0" },
        { status: 400 }
      );
    }

    if (sleepScore !== undefined && sleepScore !== null && (sleepScore < 0 || sleepScore > 100)) {
      return NextResponse.json(
        { error: "睡眠评分范围为0-100" },
        { status: 400 }
      );
    }

    if (heartRate !== undefined && heartRate !== null && (heartRate < 30 || heartRate > 200)) {
      return NextResponse.json(
        { error: "心率范围为30-200" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (date) updateData.date = new Date(date);
    if (sleepDuration !== undefined) updateData.sleepDuration = parseFloat(sleepDuration);
    if (bedTime) updateData.bedTime = new Date(`${date || existingRecord.date.toISOString().split('T')[0]}T${bedTime}:00`);
    if (wakeTime) updateData.wakeTime = new Date(`${date || existingRecord.date.toISOString().split('T')[0]}T${wakeTime}:00`);
    if (deepSleep !== undefined) updateData.deepSleep = deepSleep ? parseFloat(deepSleep) : null;
    if (lightSleep !== undefined) updateData.lightSleep = lightSleep ? parseFloat(lightSleep) : null;
    if (remSleep !== undefined) updateData.remSleep = remSleep ? parseFloat(remSleep) : null;
    if (awakeCount !== undefined) updateData.awakeCount = awakeCount ? parseInt(awakeCount) : null;
    if (sleepScore !== undefined) updateData.sleepScore = sleepScore ? parseInt(sleepScore) : null;
    if (heartRate !== undefined) updateData.heartRate = heartRate ? parseInt(heartRate) : null;

    const record = await prisma.sleepRecord.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Update sleep record error:", error);
    return NextResponse.json({ error: "更新记录失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;

    // 检查记录是否存在且属于当前用户
    const existingRecord = await prisma.sleepRecord.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    await prisma.sleepRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete sleep record error:", error);
    return NextResponse.json({ error: "删除记录失败" }, { status: 500 });
  }
}
