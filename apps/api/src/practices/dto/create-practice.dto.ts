import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class CreatePracticeDto {
  @IsString()
  lessonId!: string;

  @IsString()
  @MinLength(3)
  titleEs!: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsBoolean()
  requiresSimulator?: boolean;
}
