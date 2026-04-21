import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class AddCertificationTrackCourseDto {
  @IsString()
  certificationTrackId!: string;

  @IsString()
  courseId!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimumScore?: number;
}
