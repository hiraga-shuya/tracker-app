-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Habit_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon_type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Habit_Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Habit_Task" ("created_at", "deleted_at", "icon_type", "id", "is_active", "name", "updated_at", "userId") SELECT "created_at", "deleted_at", "icon_type", "id", "is_active", "name", "updated_at", "userId" FROM "Habit_Task";
DROP TABLE "Habit_Task";
ALTER TABLE "new_Habit_Task" RENAME TO "Habit_Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
