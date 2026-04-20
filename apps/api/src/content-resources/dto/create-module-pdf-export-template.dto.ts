import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateModulePdfExportTemplateDto {
  @IsString()
  moduleId!: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  titleTemplate?: string;

  @IsOptional()
  @IsBoolean()
  includeSkillEvidence?: boolean;

  @IsOptional()
  @IsBoolean()
  includePracticeSummary?: boolean;
}
