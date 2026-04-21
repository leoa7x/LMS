-- CreateEnum
CREATE TYPE "VoiceoverSourceKind" AS ENUM ('UPLOADED', 'TTS_REFERENCE', 'MANUAL_RECORDING');

-- CreateEnum
CREATE TYPE "VoiceoverStatus" AS ENUM ('DRAFT', 'READY', 'FAILED', 'DISABLED');

-- CreateEnum
CREATE TYPE "InteractiveContentKind" AS ENUM ('EMBEDDED_WIDGET', 'DIAGRAM_COMPONENT_MAP', 'STEP_GUIDED_ACTIVITY', 'THREE_D_SCENE');

-- CreateTable
CREATE TABLE "ContentVoiceoverTrack" (
    "id" TEXT NOT NULL,
    "contentResourceId" TEXT,
    "lessonSegmentId" TEXT,
    "language" TEXT NOT NULL,
    "sourceKind" "VoiceoverSourceKind" NOT NULL,
    "status" "VoiceoverStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,
    "transcriptEs" TEXT,
    "transcriptEn" TEXT,
    "audioUri" TEXT,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentVoiceoverTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractiveContentConfig" (
    "id" TEXT NOT NULL,
    "contentResourceId" TEXT,
    "lessonSegmentId" TEXT,
    "kind" "InteractiveContentKind" NOT NULL,
    "titleEs" TEXT NOT NULL,
    "titleEn" TEXT,
    "configJson" JSONB NOT NULL,
    "embedUri" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InteractiveContentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentVoiceoverTrack_contentResourceId_language_idx" ON "ContentVoiceoverTrack"("contentResourceId", "language");

-- CreateIndex
CREATE INDEX "ContentVoiceoverTrack_lessonSegmentId_language_idx" ON "ContentVoiceoverTrack"("lessonSegmentId", "language");

-- CreateIndex
CREATE INDEX "InteractiveContentConfig_contentResourceId_idx" ON "InteractiveContentConfig"("contentResourceId");

-- CreateIndex
CREATE INDEX "InteractiveContentConfig_lessonSegmentId_idx" ON "InteractiveContentConfig"("lessonSegmentId");

-- AddForeignKey
ALTER TABLE "ContentVoiceoverTrack" ADD CONSTRAINT "ContentVoiceoverTrack_contentResourceId_fkey" FOREIGN KEY ("contentResourceId") REFERENCES "ContentResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVoiceoverTrack" ADD CONSTRAINT "ContentVoiceoverTrack_lessonSegmentId_fkey" FOREIGN KEY ("lessonSegmentId") REFERENCES "LessonSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractiveContentConfig" ADD CONSTRAINT "InteractiveContentConfig_contentResourceId_fkey" FOREIGN KEY ("contentResourceId") REFERENCES "ContentResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractiveContentConfig" ADD CONSTRAINT "InteractiveContentConfig_lessonSegmentId_fkey" FOREIGN KEY ("lessonSegmentId") REFERENCES "LessonSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
