import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateTechnicalAreaDto {
  @IsString()
  @MinLength(3)
  slug!: string;

  @IsString()
  @MinLength(3)
  nameEs!: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
