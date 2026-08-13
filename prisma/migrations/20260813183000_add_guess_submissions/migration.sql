-- CreateTable
CREATE TABLE "public"."Guess" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guess_questionId_teamId_key" ON "public"."Guess"("questionId", "teamId");

-- CreateIndex
CREATE INDEX "Guess_questionId_idx" ON "public"."Guess"("questionId");

-- CreateIndex
CREATE INDEX "Guess_teamId_idx" ON "public"."Guess"("teamId");

-- CreateIndex
CREATE INDEX "Guess_userId_idx" ON "public"."Guess"("userId");

-- AddForeignKey
ALTER TABLE "public"."Guess" ADD CONSTRAINT "Guess_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guess" ADD CONSTRAINT "Guess_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guess" ADD CONSTRAINT "Guess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
