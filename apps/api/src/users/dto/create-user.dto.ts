import {
  EnrollmentStatus,
  MembershipStatus,
  ScopeType,
  SystemRole,
  UserStatus,
} from "@prisma/client";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateUserMembershipDto {
  @IsString()
  institutionId!: string;

  @IsOptional()
  @IsString()
  campusId?: string;

  @IsOptional()
  @IsString()
  laboratoryId?: string;

  @IsOptional()
  @IsString()
  licenseId?: string;

  @IsOptional()
  @IsString()
  contractTermId?: string;

  @IsOptional()
  @IsEnum(MembershipStatus)
  membershipStatus?: MembershipStatus;

  @IsOptional()
  @IsDateString()
  accessStartAt?: string;

  @IsOptional()
  @IsDateString()
  accessEndAt?: string;
}

export class CreateUserRoleAssignmentDto {
  @IsEnum(SystemRole)
  role!: SystemRole;

  @IsOptional()
  @IsEnum(ScopeType)
  scopeType?: ScopeType;

  @IsOptional()
  @IsString()
  campusId?: string;

  @IsOptional()
  @IsString()
  laboratoryId?: string;

  @IsOptional()
  @IsString()
  technicalAreaId?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  learningPathId?: string;

  @IsOptional()
  @IsString()
  levelCode?: string;
}

export class CreateStudentProfileDto {
  @IsString()
  currentLevel!: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  academicStatus?: EnrollmentStatus;

  @IsOptional()
  @IsString()
  cohort?: string;

  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @IsDateString()
  expectedEndDate?: string;
}

export class CreateTeacherScopeDto {
  @IsEnum(ScopeType)
  scopeType!: ScopeType;

  @IsOptional()
  @IsString()
  institutionId?: string;

  @IsOptional()
  @IsString()
  campusId?: string;

  @IsOptional()
  @IsString()
  laboratoryId?: string;

  @IsOptional()
  @IsString()
  technicalAreaId?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  learningPathId?: string;

  @IsOptional()
  @IsString()
  levelCode?: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveUntil?: string;
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  preferredLang?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ValidateNested()
  @Type(() => CreateUserMembershipDto)
  membership!: CreateUserMembershipDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateUserRoleAssignmentDto)
  roleAssignments!: CreateUserRoleAssignmentDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateStudentProfileDto)
  studentProfile?: CreateStudentProfileDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTeacherScopeDto)
  teacherScopes?: CreateTeacherScopeDto[];
}
