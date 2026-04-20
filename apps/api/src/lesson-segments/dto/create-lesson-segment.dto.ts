import { LessonSegmentType } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class CreateLessonSegmentDto {
  @IsString()
  lessonId!: string;

  @IsEnum(LessonSegmentType)
  type!: LessonSegmentType;

  @IsString()
  @MinLength(2)
  titleEs!: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  bodyEs?: string;

  @IsOptional()
  @IsString()
  bodyEn?: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsOptional()
  @IsBoolean()
  voiceoverEnabled?: boolean;

  @IsOptional()
  @IsString()
  resourceId?: string;
}
