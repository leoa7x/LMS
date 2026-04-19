import { SystemRole } from "@prisma/client";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ArrayNotEmpty,
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  preferredLang?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(SystemRole, { each: true })
  roles?: SystemRole[];

  @IsOptional()
  @IsString()
  institutionId?: string;
}
