import { SupportTicketPriority, SupportTicketStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateSupportTicketDto {
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  @IsOptional()
  @IsString()
  assignedToUserId?: string;
}
