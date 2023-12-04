-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Weapon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "AT" INTEGER NOT NULL,
    "FP" INTEGER NOT NULL,
    "specials" TEXT NOT NULL,
    "firerate" INTEGER NOT NULL,
    "range" INTEGER NOT NULL DEFAULT 20,
    "game" TEXT NOT NULL
);
INSERT INTO "new_Weapon" ("AT", "FP", "firerate", "game", "id", "name", "specials") SELECT "AT", "FP", "firerate", "game", "id", "name", "specials" FROM "Weapon";
DROP TABLE "Weapon";
ALTER TABLE "new_Weapon" RENAME TO "Weapon";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
