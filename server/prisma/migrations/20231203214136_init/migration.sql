/*
  Warnings:

  - You are about to alter the column `transport` on the `Team` table. The data in that column could be lost. The data in that column will be cast from `Boolean` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "def" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "mat" INTEGER NOT NULL,
    "rat" INTEGER NOT NULL,
    "reactions" INTEGER NOT NULL,
    "motivation" INTEGER NOT NULL,
    "skill" INTEGER NOT NULL,
    "save" INTEGER NOT NULL,
    "armourFront" INTEGER NOT NULL,
    "armourSide" INTEGER NOT NULL,
    "armourTop" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "imgSide" TEXT NOT NULL,
    "imgTop" TEXT NOT NULL,
    "effects" TEXT NOT NULL,
    "specials" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "order" TEXT NOT NULL,
    "weapons" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "transport" INTEGER NOT NULL,
    "transporting" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "target" TEXT NOT NULL
);
INSERT INTO "new_Team" ("armourFront", "armourSide", "armourTop", "def", "desc", "effects", "faction", "id", "imgSide", "imgTop", "mat", "motivation", "name", "nickname", "order", "rat", "reactions", "save", "skill", "specials", "speed", "target", "transport", "transporting", "type", "unit", "weapons") SELECT "armourFront", "armourSide", "armourTop", "def", "desc", "effects", "faction", "id", "imgSide", "imgTop", "mat", "motivation", "name", "nickname", "order", "rat", "reactions", "save", "skill", "specials", "speed", "target", "transport", "transporting", "type", "unit", "weapons" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
