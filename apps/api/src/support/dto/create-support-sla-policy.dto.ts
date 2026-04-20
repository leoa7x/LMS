import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateSupportSlaPolicyDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  responseHours?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  resolutionHours?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
