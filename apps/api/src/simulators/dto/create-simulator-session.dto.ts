import { IsOptional, IsString } from "class-validator";

export class CreateSimulatorSessionDto {
  @IsString()
  simulatorId!: string;

  @IsString()
  studentId!: string;

  @IsOptional()
  @IsString()
  enrollmentId?: string;
}
