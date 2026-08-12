-- CreateEnum
CREATE TYPE "public"."GameStatus" AS ENUM ('DRAFT', 'LOBBY', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "joinCode" TEXT NOT NULL,
    "status" "public"."GameStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_joinCode_key" ON "public"."Game"("joinCode");

-- CreateIndex
CREATE INDEX "Game_createdById_idx" ON "public"."Game"("createdById");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "public"."Game"("status");

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
