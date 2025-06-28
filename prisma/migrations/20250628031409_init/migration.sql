-- CreateTable
CREATE TABLE "QueryResponse" (
    "id" SERIAL NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guid" TEXT NOT NULL,

    CONSTRAINT "QueryResponse_pkey" PRIMARY KEY ("id")
);
