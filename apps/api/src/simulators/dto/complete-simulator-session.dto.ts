import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { SimulatorSessionStatus } from "@prisma/client";

export class CompleteSimulatorSessionDto {
  @IsString()
  sessionId!: string;

  @IsEnum(SimulatorSessionStatus)
  status!: SimulatorSessionStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;
}
