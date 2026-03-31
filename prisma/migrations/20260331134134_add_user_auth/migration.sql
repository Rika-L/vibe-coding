-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SleepRecord" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "SleepRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SleepRecord" ("awakeCount", "bedTime", "createdAt", "date", "deepSleep", "heartRate", "id", "lightSleep", "remSleep", "sleepDuration", "sleepScore", "wakeTime") SELECT "awakeCount", "bedTime", "createdAt", "date", "deepSleep", "heartRate", "id", "lightSleep", "remSleep", "sleepDuration", "sleepScore", "wakeTime" FROM "SleepRecord";
DROP TABLE "SleepRecord";
ALTER TABLE "new_SleepRecord" RENAME TO "SleepRecord";
CREATE INDEX "SleepRecord_date_idx" ON "SleepRecord"("date");
CREATE INDEX "SleepRecord_userId_idx" ON "SleepRecord"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
