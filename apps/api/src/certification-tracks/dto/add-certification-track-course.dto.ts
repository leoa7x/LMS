import { IsString } from "class-validator";

export class AddCertificationTrackCourseDto {
  @IsString()
  certificationTrackId!: string;

  @IsString()
  courseId!: string;
}
