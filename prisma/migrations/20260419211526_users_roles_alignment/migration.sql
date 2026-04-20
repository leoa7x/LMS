-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ScopeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('GLOBAL', 'INSTITUTION', 'CAMPUS', 'LABORATORY', 'TECHNICAL_AREA', 'COURSE', 'LEARNING_PATH', 'LEVEL');

-- CreateEnum
CREATE TYPE "AccessSessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "UserLifecycleEventType" AS ENUM ('CREATED', 'UPDATED', 'ACTIVATED', 'DEACTIVATED', 'ROLE_ASSIGNED', 'ROLE_REMOVED', 'MEMBERSHIP_CHANGED', 'ACCESS_REVOKED');

-- DropIndex
DROP INDEX "UserRole_userId_roleId_key";

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "officialCode" TEXT,
ADD COLUMN     "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "deactivationReason" TEXT,
ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "documentType" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginIp" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "UserInstitution" ADD COLUMN     "accessEndAt" TIMESTAMP(3),
ADD COLUMN     "accessStartAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "campusId" TEXT,
ADD COLUMN     "contractTermId" TEXT,
ADD COLUMN     "laboratoryId" TEXT,
ADD COLUMN     "licenseId" TEXT,
ADD COLUMN     "membershipStatus" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "assignedByUserId" TEXT,
ADD COLUMN     "campusId" TEXT,
ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "institutionMemberId" TEXT,
ADD COLUMN     "laboratoryId" TEXT,
ADD COLUMN     "learningPathId" TEXT,
ADD COLUMN     "levelCode" TEXT,
ADD COLUMN     "scopeStatus" "ScopeStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "scopeType" "ScopeType" NOT NULL DEFAULT 'INSTITUTION',
ADD COLUMN     "technicalAreaId" TEXT;

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laboratory" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "technicalAreaId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laboratory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAcademicProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionMemberId" TEXT NOT NULL,
    "currentLevel" TEXT NOT NULL,
    "academicStatus" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "cohort" TEXT,
    "entryDate" TIMESTAMP(3),
    "expectedEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAcademicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentVisibilityAssignment" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "assignmentType" "ScopeType" NOT NULL,
    "levelCode" TEXT,
    "learningPathId" TEXT,
    "courseId" TEXT,
    "moduleId" TEXT,
    "assignedByUserId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMP(3),

    CONSTRAINT "StudentVisibilityAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherScopeAssignment" (
    "id" TEXT NOT NULL,
    "teacherUserId" TEXT NOT NULL,
    "scopeType" "ScopeType" NOT NULL,
    "institutionId" TEXT,
    "campusId" TEXT,
    "laboratoryId" TEXT,
    "technicalAreaId" TEXT,
    "courseId" TEXT,
    "learningPathId" TEXT,
    "levelCode" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMP(3),

    CONSTRAINT "TeacherScopeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionMemberId" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" "AccessSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,

    CONSTRAINT "AccessSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLifecycleAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" "UserLifecycleEventType" NOT NULL,
    "performedByUserId" TEXT NOT NULL,
    "reason" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLifecycleAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campus_institutionId_name_key" ON "Campus"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Laboratory_campusId_name_key" ON "Laboratory"("campusId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAcademicProfile_userId_key" ON "StudentAcademicProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAcademicProfile_institutionMemberId_key" ON "StudentAcademicProfile"("institutionMemberId");

-- CreateIndex
CREATE INDEX "UserRole_userId_scopeStatus_idx" ON "UserRole"("userId", "scopeStatus");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_institutionMemberId_fkey" FOREIGN KEY ("institutionMemberId") REFERENCES "UserInstitution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_technicalAreaId_fkey" FOREIGN KEY ("technicalAreaId") REFERENCES "TechnicalArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitution" ADD CONSTRAINT "UserInstitution_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitution" ADD CONSTRAINT "UserInstitution_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitution" ADD CONSTRAINT "UserInstitution_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitution" ADD CONSTRAINT "UserInstitution_contractTermId_fkey" FOREIGN KEY ("contractTermId") REFERENCES "ContractTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laboratory" ADD CONSTRAINT "Laboratory_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laboratory" ADD CONSTRAINT "Laboratory_technicalAreaId_fkey" FOREIGN KEY ("technicalAreaId") REFERENCES "TechnicalArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcademicProfile" ADD CONSTRAINT "StudentAcademicProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcademicProfile" ADD CONSTRAINT "StudentAcademicProfile_institutionMemberId_fkey" FOREIGN KEY ("institutionMemberId") REFERENCES "UserInstitution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVisibilityAssignment" ADD CONSTRAINT "StudentVisibilityAssignment_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentAcademicProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVisibilityAssignment" ADD CONSTRAINT "StudentVisibilityAssignment_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVisibilityAssignment" ADD CONSTRAINT "StudentVisibilityAssignment_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVisibilityAssignment" ADD CONSTRAINT "StudentVisibilityAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVisibilityAssignment" ADD CONSTRAINT "StudentVisibilityAssignment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherScopeAssignment" ADD CONSTRAINT "TeacherScopeAssignment_teacherUserId_fkey" FOREIGN KEY ("teacherUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherScopeAssignment" ADD CONSTRAINT "TeacherScopeAssignment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherScopeAssignment" ADD CONSTRAINT "TeacherScopeAssignment_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherScopeAssignment" ADD CONSTRAINT "TeacherScopeAssignment_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherScopeAssignment" ADD CONSTRAINT "TeacherScopeAssignment_technicalAreaId_fkey" FOREIGN KEY ("technicalAreaId") REFERENCES "TechnicalArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherScopeAssignment" ADD CONSTRAINT "TeacherScopeAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherScopeAssignment" ADD CONSTRAINT "TeacherScopeAssignment_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessSession" ADD CONSTRAINT "AccessSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessSession" ADD CONSTRAINT "AccessSession_institutionMemberId_fkey" FOREIGN KEY ("institutionMemberId") REFERENCES "UserInstitution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLifecycleAudit" ADD CONSTRAINT "UserLifecycleAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLifecycleAudit" ADD CONSTRAINT "UserLifecycleAudit_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
