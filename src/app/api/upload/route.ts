import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/csv-parser';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
    }

    const csvText = await file.text();
    const parsedData = await parseCSV(csvText);

    if (parsedData.length === 0) {
      return NextResponse.json({ error: 'No valid data found in CSV' }, { status: 400 });
    }

    // Save to database using batch insert
    const records = await prisma.sleepRecord.createMany({
      data: parsedData.map(item => ({
        date: new Date(item.date),
        bedTime: new Date(item.bedTime),
        wakeTime: new Date(item.wakeTime),
        sleepDuration: item.sleepDuration ?? 0,
        deepSleep: item.deepSleep,
        lightSleep: item.lightSleep,
        remSleep: item.remSleep,
        awakeCount: item.awakeCount,
        sleepScore: item.sleepScore,
        heartRate: item.heartRate,
        userId: user.userId,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      count: records.count,
      totalCount: parsedData.length,
    });
  }
  catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 },
    );
  }
}
