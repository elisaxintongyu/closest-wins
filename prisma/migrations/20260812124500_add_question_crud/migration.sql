-- CreateEnum
CREATE TYPE "public"."QuestionStatus" AS ENUM ('HIDDEN', 'OPEN', 'CLOSED', 'REVEALED');

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "correctAnswer" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "status" "public"."QuestionStatus" NOT NULL DEFAULT 'HIDDEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_gameId_idx" ON "public"."Question"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_gameId_order_key" ON "public"."Question"("gameId", "order");

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
