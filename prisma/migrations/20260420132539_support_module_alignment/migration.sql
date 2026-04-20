/*
  Warnings:

  - Added the required column `institutionId` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseDueAt` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "assignedToUserId" TEXT,
ADD COLUMN     "campusId" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "firstRespondedAt" TIMESTAMP(3),
ADD COLUMN     "institutionId" TEXT NOT NULL,
ADD COLUMN     "laboratoryId" TEXT,
ADD COLUMN     "priority" "SupportTicketPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "resolutionDueAt" TIMESTAMP(3),
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "responseDueAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "slaPolicyId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "SupportTicketComment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportTicketComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportSlaPolicy" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "responseHours" INTEGER NOT NULL DEFAULT 48,
    "resolutionHours" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportSlaPolicy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_slaPolicyId_fkey" FOREIGN KEY ("slaPolicyId") REFERENCES "SupportSlaPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketComment" ADD CONSTRAINT "SupportTicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketComment" ADD CONSTRAINT "SupportTicketComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportSlaPolicy" ADD CONSTRAINT "SupportSlaPolicy_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
