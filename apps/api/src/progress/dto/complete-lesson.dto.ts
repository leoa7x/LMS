import { IsString } from "class-validator";

export class CompleteLessonDto {
  @IsString()
  enrollmentId!: string;

  @IsString()
  lessonId!: string;
}
