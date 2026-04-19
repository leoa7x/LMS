import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateGlossaryTermDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(2)
  termEs!: string;

  @IsOptional()
  @IsString()
  termEn?: string;

  @IsString()
  @MinLength(5)
  definitionEs!: string;

  @IsOptional()
  @IsString()
  definitionEn?: string;
}
