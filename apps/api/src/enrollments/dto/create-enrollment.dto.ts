import { IsString } from "class-validator";

export class CreateEnrollmentDto {
  @IsString()
  institutionId!: string;

  @IsString()
  studentId!: string;

  @IsString()
  courseId!: string;
}
