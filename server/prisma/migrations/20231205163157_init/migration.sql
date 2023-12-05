/*
  Warnings:

  - You are about to drop the `Map` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Map";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Terrain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "houses" TEXT NOT NULL,
    "trees" TEXT NOT NULL,
    "waters" TEXT NOT NULL
);
