import { SimulatorKind } from "@prisma/client";
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

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
  @IsString()
  launchUrl?: string;

  @IsOptional()
  configJson?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isTrackable?: boolean;
}
