-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ELIGIBLE');

-- AlterTable
ALTER TABLE "CertificationTrackCourse" ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minimumScore" DOUBLE PRECISION,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "StudentCertificationStatus" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "certificationTrackId" TEXT NOT NULL,
    "learningPathAssignmentId" TEXT,
    "status" "CertificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "requiredCourses" INTEGER NOT NULL DEFAULT 0,
    "completedRequiredCourses" INTEGER NOT NULL DEFAULT 0,
    "averageFinalScore" DOUBLE PRECISION,
    "eligibleAt" TIMESTAMP(3),
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentCertificationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentCertificationStatus_studentId_certificationTrackId_key" ON "StudentCertificationStatus"("studentId", "certificationTrackId");

-- AddForeignKey
ALTER TABLE "StudentCertificationStatus" ADD CONSTRAINT "StudentCertificationStatus_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCertificationStatus" ADD CONSTRAINT "StudentCertificationStatus_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCertificationStatus" ADD CONSTRAINT "StudentCertificationStatus_certificationTrackId_fkey" FOREIGN KEY ("certificationTrackId") REFERENCES "CertificationTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCertificationStatus" ADD CONSTRAINT "StudentCertificationStatus_learningPathAssignmentId_fkey" FOREIGN KEY ("learningPathAssignmentId") REFERENCES "StudentLearningPathAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
