import { IsOptional, IsString } from "class-validator";

export class FindAccessEventsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  eventType?: string;
}
