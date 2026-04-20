import { IsObject, IsOptional, IsString } from "class-validator";

export class LogSimulatorSessionEventDto {
  @IsString()
  sessionId!: string;

  @IsString()
  eventType!: string;

  @IsOptional()
  @IsString()
  stepKey?: string;

  @IsOptional()
  @IsString()
  componentKey?: string;

  @IsOptional()
  @IsString()
  faultCode?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}
