import { IsDateString, IsOptional, IsString } from "class-validator";

export class AssignLearningPathDto {
  @IsString()
  institutionId!: string;

  @IsString()
  studentId!: string;

  @IsString()
  learningPathId!: string;

  @IsString()
  assignedLevelCode!: string;

  @IsString()
  assignedByUserId!: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveUntil?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
