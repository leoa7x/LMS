-- AlterTable
ALTER TABLE "StudentEnrollment" ADD COLUMN     "assignedByUserId" TEXT,
ADD COLUMN     "assignedLevelCode" TEXT,
ADD COLUMN     "learningPathAssignmentId" TEXT,
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "StudentLearningPathAssignment" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "assignedLevelCode" TEXT NOT NULL,
    "assignedByUserId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "StudentLearningPathAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_learningPathAssignmentId_fkey" FOREIGN KEY ("learningPathAssignmentId") REFERENCES "StudentLearningPathAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLearningPathAssignment" ADD CONSTRAINT "StudentLearningPathAssignment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLearningPathAssignment" ADD CONSTRAINT "StudentLearningPathAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLearningPathAssignment" ADD CONSTRAINT "StudentLearningPathAssignment_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
