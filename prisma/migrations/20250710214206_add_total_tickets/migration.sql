-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "price" REAL NOT NULL,
    "imageUrl" TEXT,
    "totalTickets" INTEGER NOT NULL DEFAULT 100,
    "ticketsSold" INTEGER NOT NULL DEFAULT 0,
    "organizerId" INTEGER NOT NULL,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("date", "description", "id", "imageUrl", "organizerId", "price", "title") SELECT "date", "description", "id", "imageUrl", "organizerId", "price", "title" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
