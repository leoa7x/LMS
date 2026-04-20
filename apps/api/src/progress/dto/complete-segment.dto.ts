import { IsString } from "class-validator";

export class CompleteSegmentDto {
  @IsString()
  enrollmentId!: string;

  @IsString()
  lessonSegmentId!: string;
}
