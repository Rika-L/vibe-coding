import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: {
      userId: string;
      date?: { gte?: Date; lte?: Date };
    } = {
      userId: user.userId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // 获取总数
    const total = await prisma.sleepRecord.count({ where });

    // 获取数据
    const records = await prisma.sleepRecord.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get sleep history error:", error);
    return NextResponse.json(
      { error: "获取历史数据失败" },
      { status: 500 }
    );
  }
}
