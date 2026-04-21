import { IsIn, IsOptional, IsString } from "class-validator";

export class FindAccessSessionsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsIn(["ACTIVE", "REVOKED", "EXPIRED"])
  status?: "ACTIVE" | "REVOKED" | "EXPIRED";

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
