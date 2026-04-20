import { IsBoolean, IsInt, IsString, Min } from "class-validator";

export class AddLearningPathCourseDto {
  @IsString()
  learningPathId!: string;

  @IsString()
  courseId!: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsBoolean()
  isRequired!: boolean;
}
