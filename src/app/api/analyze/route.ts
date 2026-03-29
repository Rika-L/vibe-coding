import { NextResponse } from "next/server";
import { generateText } from "ai";
import { aiModel } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

interface SleepRecord {
  date: Date;
  sleepDuration: number;
  deepSleep: number | null;
  lightSleep: number | null;
  remSleep: number | null;
  sleepScore: number | null;
  heartRate: number | null;
}

export async function POST() {
  try {
    const records = await prisma.sleepRecord.findMany({
      orderBy: { date: "asc" },
      take: 30,
    });

    if (records.length === 0) {
      return NextResponse.json(
        { error: "No sleep data found" },
        { status: 400 }
      );
    }

    const dataSummary = records.map((r: SleepRecord) => ({
      date: r.date.toISOString().split("T")[0],
      duration: r.sleepDuration,
      deep: r.deepSleep,
      light: r.lightSleep,
      rem: r.remSleep,
      score: r.sleepScore,
      heartRate: r.heartRate,
    }));

    const avgDuration =
      records.reduce((sum: number, r: SleepRecord) => sum + r.sleepDuration, 0) / records.length;
    const avgScore =
      records.reduce((sum: number, r: SleepRecord) => sum + (r.sleepScore || 0), 0) /
      records.filter((r: SleepRecord) => r.sleepScore).length;

    const prompt = `作为睡眠健康专家，请分析以下睡眠数据并生成报告：

数据概览：
- 记录天数：${records.length}天
- 平均睡眠时长：${avgDuration.toFixed(1)}小时
- 平均睡眠评分：${avgScore.toFixed(0)}分

详细数据：
${JSON.stringify(dataSummary, null, 2)}

请提供以下分析（用JSON格式返回）：
{
  "summary": "整体睡眠情况总结（100字以内）",
  "sleepQuality": "睡眠质量评价：优秀/良好/一般/较差",
  "suggestions": "3-5条改善睡眠的具体建议"
}`;

    const { text } = await generateText({
      model: aiModel,
      prompt,
    });

    // Parse AI response
    let analysis;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      analysis = {
        summary: text.slice(0, 200),
        sleepQuality: "良好",
        suggestions: "建议保持规律作息",
      };
    }

    // Save report
    const report = await prisma.analysisReport.create({
      data: {
        title: `睡眠分析报告 - ${new Date().toLocaleDateString()}`,
        summary: analysis.summary || "",
        suggestions: analysis.suggestions || "",
        sleepQuality: analysis.sleepQuality || "良好",
        dataRange: `${records[0].date.toLocaleDateString()} 至 ${records[records.length - 1].date.toLocaleDateString()}`,
      },
    });

    return NextResponse.json({ report, analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze data" },
      { status: 500 }
    );
  }
}
