import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class CreateCourseDto {
  @IsString()
  technicalAreaId!: string;

  @IsString()
  @MinLength(3)
  slug!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  @MinLength(3)
  titleEs!: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  descriptionEs?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  progressStrategy?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  lessonWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  practiceWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  evaluationWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  simulatorWeight?: number;
}
