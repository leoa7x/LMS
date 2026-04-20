import { IsOptional, IsString } from "class-validator";

export class ModulePdfExportQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  lang?: string;
}
