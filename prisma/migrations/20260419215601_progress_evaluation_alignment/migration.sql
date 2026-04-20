-- CreateEnum
CREATE TYPE "PracticeAttemptStatus" AS ENUM ('STARTED', 'SUBMITTED', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "QuizAttemptSource" AS ENUM ('STANDARD', 'RETAKE_OVERRIDE');

-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN     "attemptNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "attemptSource" "QuizAttemptSource" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "overrideGrantId" TEXT;

-- AlterTable
ALTER TABLE "StudentProgress" ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "segmentsDone" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LessonSegmentProgress" (
    "id" TEXT NOT NULL,
    "lessonSegmentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LessonSegmentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeAttempt" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "PracticeAttemptStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" DOUBLE PRECISION,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizRetakeGrant" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "grantedByUserId" TEXT NOT NULL,
    "courseId" TEXT,
    "moduleId" TEXT,
    "reason" TEXT NOT NULL,
    "maxExtraAttempts" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizRetakeGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonSegmentProgress_lessonSegmentId_enrollmentId_key" ON "LessonSegmentProgress"("lessonSegmentId", "enrollmentId");

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_overrideGrantId_fkey" FOREIGN KEY ("overrideGrantId") REFERENCES "QuizRetakeGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSegmentProgress" ADD CONSTRAINT "LessonSegmentProgress_lessonSegmentId_fkey" FOREIGN KEY ("lessonSegmentId") REFERENCES "LessonSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSegmentProgress" ADD CONSTRAINT "LessonSegmentProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRetakeGrant" ADD CONSTRAINT "QuizRetakeGrant_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRetakeGrant" ADD CONSTRAINT "QuizRetakeGrant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRetakeGrant" ADD CONSTRAINT "QuizRetakeGrant_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRetakeGrant" ADD CONSTRAINT "QuizRetakeGrant_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRetakeGrant" ADD CONSTRAINT "QuizRetakeGrant_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;
