import { IsString } from "class-validator";

export class CreateSimulatorMappingDto {
  @IsString()
  simulatorId!: string;

  @IsString()
  practiceId!: string;
}
