-- CreateTable
CREATE TABLE "ContentResourceVersion" (
    "id" TEXT NOT NULL,
    "contentResourceId" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "titleEs" TEXT NOT NULL,
    "titleEn" TEXT,
    "bodyEs" TEXT,
    "bodyEn" TEXT,
    "uri" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentResourceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossaryTermRelation" (
    "id" TEXT NOT NULL,
    "glossaryTermId" TEXT NOT NULL,
    "contentResourceId" TEXT NOT NULL,

    CONSTRAINT "GlossaryTermRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModulePdfExportTemplate" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "titleTemplate" TEXT,
    "includeSkillEvidence" BOOLEAN NOT NULL DEFAULT true,
    "includePracticeSummary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModulePdfExportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlossaryTermRelation_glossaryTermId_contentResourceId_key" ON "GlossaryTermRelation"("glossaryTermId", "contentResourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ModulePdfExportTemplate_moduleId_key" ON "ModulePdfExportTemplate"("moduleId");

-- AddForeignKey
ALTER TABLE "ContentResourceVersion" ADD CONSTRAINT "ContentResourceVersion_contentResourceId_fkey" FOREIGN KEY ("contentResourceId") REFERENCES "ContentResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossaryTermRelation" ADD CONSTRAINT "GlossaryTermRelation_glossaryTermId_fkey" FOREIGN KEY ("glossaryTermId") REFERENCES "GlossaryTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossaryTermRelation" ADD CONSTRAINT "GlossaryTermRelation_contentResourceId_fkey" FOREIGN KEY ("contentResourceId") REFERENCES "ContentResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulePdfExportTemplate" ADD CONSTRAINT "ModulePdfExportTemplate_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
