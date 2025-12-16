-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "date" TIMESTAMP(3),
    "description" TEXT,
    "category" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_organizationId_idx" ON "transactions"("organizationId");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
