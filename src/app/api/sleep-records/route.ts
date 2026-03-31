import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
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

    // 验证必填字段
    if (!date || sleepDuration === undefined || sleepDuration === null) {
      return NextResponse.json(
        { error: "日期和睡眠时长为必填项" },
        { status: 400 }
      );
    }

    // 验证数据范围
    if (sleepDuration <= 0) {
      return NextResponse.json(
        { error: "睡眠时长必须大于0" },
        { status: 400 }
      );
    }

    if (sleepScore !== null && sleepScore !== undefined && (sleepScore < 0 || sleepScore > 100)) {
      return NextResponse.json(
        { error: "睡眠评分范围为0-100" },
        { status: 400 }
      );
    }

    if (heartRate !== null && heartRate !== undefined && (heartRate < 30 || heartRate > 200)) {
      return NextResponse.json(
        { error: "心率范围为30-200" },
        { status: 400 }
      );
    }

    // 检查日期是否已有记录
    const existingRecord = await prisma.sleepRecord.findFirst({
      where: {
        userId: user.userId,
        date: new Date(date),
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: "该日期已有睡眠记录" },
        { status: 400 }
      );
    }

    const record = await prisma.sleepRecord.create({
      data: {
        date: new Date(date),
        sleepDuration: parseFloat(sleepDuration),
        bedTime: bedTime ? new Date(`${date}T${bedTime}:00`) : new Date(`${date}T23:00:00`),
        wakeTime: wakeTime ? new Date(`${date}T${wakeTime}:00`) : new Date(`${date}T07:00:00`),
        deepSleep: deepSleep ? parseFloat(deepSleep) : null,
        lightSleep: lightSleep ? parseFloat(lightSleep) : null,
        remSleep: remSleep ? parseFloat(remSleep) : null,
        awakeCount: awakeCount ? parseInt(awakeCount) : null,
        sleepScore: sleepScore ? parseInt(sleepScore) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        userId: user.userId,
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Create sleep record error:", error);
    return NextResponse.json(
      { error: "创建记录失败" },
      { status: 500 }
    );
  }
}
