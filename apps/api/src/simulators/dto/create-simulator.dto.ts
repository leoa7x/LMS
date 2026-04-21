import { SimulatorKind } from "@prisma/client";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateSimulatorDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(3)
  name!: string;

  @IsEnum(SimulatorKind)
  kind!: SimulatorKind;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vendorCoverageTags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologyCoverageTags?: string[];

  @IsOptional()
  @IsString()
  launchUrl?: string;

  @IsOptional()
  configJson?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isTrackable?: boolean;
}
