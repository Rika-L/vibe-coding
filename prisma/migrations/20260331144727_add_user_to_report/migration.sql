-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnalysisReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "sleepQuality" TEXT NOT NULL,
    "dataRange" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "AnalysisReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AnalysisReport" ("createdAt", "dataRange", "id", "sleepQuality", "suggestions", "summary", "title") SELECT "createdAt", "dataRange", "id", "sleepQuality", "suggestions", "summary", "title" FROM "AnalysisReport";
DROP TABLE "AnalysisReport";
ALTER TABLE "new_AnalysisReport" RENAME TO "AnalysisReport";
CREATE INDEX "AnalysisReport_userId_idx" ON "AnalysisReport"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
