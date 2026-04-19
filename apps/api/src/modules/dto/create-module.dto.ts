import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateModuleDto {
  @IsString()
  courseId!: string;

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
  description?: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;
}
