-- CreateTable
CREATE TABLE "Army" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "units" TEXT NOT NULL
);
