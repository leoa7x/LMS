import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateCertificationTrackDto {
  @IsString()
  @MinLength(3)
  slug!: string;

  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(2)
  issuer!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
