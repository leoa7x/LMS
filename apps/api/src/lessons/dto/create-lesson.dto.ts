import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateLessonDto {
  @IsString()
  moduleId!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(3)
  titleEs!: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  summaryEs?: string;

  @IsOptional()
  @IsString()
  summaryEn?: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;
}
