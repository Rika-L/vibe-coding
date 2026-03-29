-- CreateTable
CREATE TABLE "SleepRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "bedTime" DATETIME NOT NULL,
    "wakeTime" DATETIME NOT NULL,
    "sleepDuration" REAL NOT NULL,
    "deepSleep" REAL,
    "lightSleep" REAL,
    "remSleep" REAL,
    "awakeCount" INTEGER,
    "sleepScore" INTEGER,
    "heartRate" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AnalysisReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "sleepQuality" TEXT NOT NULL,
    "dataRange" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "SleepRecord_date_idx" ON "SleepRecord"("date");
