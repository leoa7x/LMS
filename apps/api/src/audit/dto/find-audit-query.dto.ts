import { IsOptional, IsString } from "class-validator";

export class FindAuditQueryDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
