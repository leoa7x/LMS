import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class QuizAnswerInputDto {
  @IsString()
  questionId!: string;

  @IsOptional()
  @IsString()
  answerOptionId?: string;
}

export class SubmitQuizAttemptDto {
  @IsString()
  quizId!: string;

  @IsString()
  userId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerInputDto)
  answers!: QuizAnswerInputDto[];
}
