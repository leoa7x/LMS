import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class GrantQuizRetakeDto {
  @IsString()
  quizId!: string;

  @IsString()
  studentId!: string;

  @IsString()
  grantedByUserId!: string;

  @IsString()
  @MaxLength(500)
  reason!: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxExtraAttempts?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
