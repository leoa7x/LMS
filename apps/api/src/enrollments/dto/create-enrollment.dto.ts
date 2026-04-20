import { IsOptional, IsString } from "class-validator";

export class CreateEnrollmentDto {
  @IsString()
  institutionId!: string;

  @IsString()
  studentId!: string;

  @IsString()
  courseId!: string;

  @IsOptional()
  @IsString()
  assignedByUserId?: string;

  @IsOptional()
  @IsString()
  assignedLevelCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
