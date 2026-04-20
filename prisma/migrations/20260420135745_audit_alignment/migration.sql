-- CreateEnum
CREATE TYPE "AccessEventType" AS ENUM ('LOGIN_SUCCESS', 'TOKEN_REFRESH', 'LOGOUT');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "actorRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "institutionId" TEXT,
ADD COLUMN     "institutionMemberId" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- CreateTable
CREATE TABLE "AccessEventLog" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "userId" TEXT,
    "institutionMemberId" TEXT,
    "sessionId" TEXT,
    "eventType" "AccessEventType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessEventLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_institutionMemberId_fkey" FOREIGN KEY ("institutionMemberId") REFERENCES "UserInstitution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AccessSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessEventLog" ADD CONSTRAINT "AccessEventLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessEventLog" ADD CONSTRAINT "AccessEventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessEventLog" ADD CONSTRAINT "AccessEventLog_institutionMemberId_fkey" FOREIGN KEY ("institutionMemberId") REFERENCES "UserInstitution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessEventLog" ADD CONSTRAINT "AccessEventLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AccessSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
