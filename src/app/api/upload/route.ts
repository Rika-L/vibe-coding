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

    // Save to database
    // Note: skipDuplicates is only supported in PostgreSQL, not SQLite
    const isSQLite = process.env.DATABASE_URL?.startsWith('file:');

    // Use createMany for PostgreSQL (with skipDuplicates) or individual creates for SQLite
    let createdRecords;
    if (isSQLite) {
      // SQLite: create individually to collect records
      createdRecords = await Promise.all(
        parsedData.map(item =>
          prisma.sleepRecord.create({
            data: {
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
            },
          }),
        ),
      );
    }
    else {
      // PostgreSQL: use createMany with skipDuplicates
      const result = await prisma.sleepRecord.createMany({
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

      // Query the created records
      const dates = parsedData.map(item => new Date(item.date));
      createdRecords = await prisma.sleepRecord.findMany({
        where: {
          userId: user.userId,
          date: { in: dates },
        },
        orderBy: { date: 'asc' },
      });
    }

    return NextResponse.json({
      success: true,
      count: createdRecords.length,
      totalCount: parsedData.length,
      failedCount: parsedData.length - createdRecords.length,
      records: createdRecords,
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
