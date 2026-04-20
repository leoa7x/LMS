import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class CreateContentResourceVersionDto {
  @IsString()
  contentResourceId!: string;

  @IsString()
  @MinLength(1)
  versionLabel!: string;

  @IsString()
  @MinLength(3)
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

  @IsOptional()
  @IsString()
  uri?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}
