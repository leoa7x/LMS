import { QuizKind } from "@prisma/client";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class CreateQuizDto {
  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsString()
  @MinLength(3)
  titleEs!: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsEnum(QuizKind)
  kind!: QuizKind;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;
}
