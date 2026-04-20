import { SupportTicketPriority } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class CreateSupportTicketDto {
  @IsString()
  @MinLength(3)
  subject!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  @IsOptional()
  @IsString()
  campusId?: string;

  @IsOptional()
  @IsString()
  laboratoryId?: string;
}
