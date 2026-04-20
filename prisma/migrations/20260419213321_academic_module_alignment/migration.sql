-- CreateEnum
CREATE TYPE "CourseKind" AS ENUM ('STANDARD', 'PRECONFIGURED');

-- CreateEnum
CREATE TYPE "LessonSegmentType" AS ENUM ('THEORY', 'RESOURCE', 'INTERACTIVE', 'GLOSSARY_LINK', 'DIAGRAM', 'SIMULATION_BRIDGE');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "courseKind" "CourseKind" NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "LearningPath" ADD COLUMN     "levelCode" TEXT;

-- CreateTable
CREATE TABLE "LessonSegment" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" "LessonSegmentType" NOT NULL,
    "titleEs" TEXT NOT NULL,
    "titleEn" TEXT,
    "bodyEs" TEXT,
    "bodyEn" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "voiceoverEnabled" BOOLEAN NOT NULL DEFAULT false,
    "resourceId" TEXT,

    CONSTRAINT "LessonSegment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LessonSegment" ADD CONSTRAINT "LessonSegment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSegment" ADD CONSTRAINT "LessonSegment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "ContentResource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
