import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateLicenseDto {
  @IsString()
  institutionId!: string;

  @IsOptional()
  @IsString()
  contractTermId?: string;

  @IsString()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMonths?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;
}
