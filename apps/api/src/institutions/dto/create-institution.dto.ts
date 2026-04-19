import { IsString, MinLength } from "class-validator";

export class CreateInstitutionDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(3)
  slug!: string;
}
