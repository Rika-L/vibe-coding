import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const records = await prisma.sleepRecord.findMany({
      where: { userId: user.userId },
      select: { date: true },
      orderBy: { date: "asc" },
    });

    const dates = records.map((r) => r.date.toISOString().split("T")[0]);

    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Fetch sleep dates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sleep dates" },
      { status: 500 }
    );
  }
}
