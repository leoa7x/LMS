import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CompletePracticeDto {
  @IsString()
  enrollmentId!: string;

  @IsString()
  practiceId!: string;

  @IsString()
  studentId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;
}
