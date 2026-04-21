import { InteractiveContentKind } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateInteractiveContentConfigDto {
  @IsOptional()
  @IsString()
  contentResourceId?: string;

  @IsOptional()
  @IsString()
  lessonSegmentId?: string;

  @IsEnum(InteractiveContentKind)
  kind!: InteractiveContentKind;

  @IsString()
  @MinLength(2)
  titleEs!: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsObject()
  configJson!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  embedUri?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
