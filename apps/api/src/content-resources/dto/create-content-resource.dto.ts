import { ContentResourceType } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateContentResourceDto {
  @IsString()
  lessonId!: string;

  @IsEnum(ContentResourceType)
  type!: ContentResourceType;

  @IsString()
  @MinLength(3)
  titleEs!: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  uri?: string;

  @IsOptional()
  @IsString()
  bodyEs?: string;

  @IsOptional()
  @IsString()
  bodyEn?: string;

  @IsOptional()
  @IsBoolean()
  voiceoverEnabled?: boolean;
}
