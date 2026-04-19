import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class CreateAnswerOptionDto {
  @IsString()
  @MinLength(1)
  labelEs!: string;

  @IsOptional()
  @IsString()
  labelEn?: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateQuestionDto {
  @IsString()
  quizId!: string;

  @IsString()
  @MinLength(3)
  promptEs!: string;

  @IsOptional()
  @IsString()
  promptEn?: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionDto)
  options!: CreateAnswerOptionDto[];
}
