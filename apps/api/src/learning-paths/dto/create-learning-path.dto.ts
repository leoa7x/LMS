import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateLearningPathDto {
  @IsString()
  @MinLength(3)
  slug!: string;

  @IsString()
  @MinLength(3)
  titleEs!: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  levelCode?: string;
}
