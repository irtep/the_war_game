-- CreateTable
CREATE TABLE "Team" (
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
    "transport" BOOLEAN NOT NULL,
    "transporting" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "target" TEXT NOT NULL
);
