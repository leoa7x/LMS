import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { CreateSupportSlaPolicyDto } from "./dto/create-support-sla-policy.dto";
import { CreateSupportTicketCommentDto } from "./dto/create-support-ticket-comment.dto";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { UpdateSupportTicketDto } from "./dto/update-support-ticket.dto";
import { SupportService } from "./support.service";

@Controller("support")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get("tickets")
  findTickets(@Req() req: Request) {
    return this.supportService.findTickets(req.user as JwtPayload);
  }

  @Get("operations/summary")
  findOperationsSummary(@Req() req: Request) {
    return this.supportService.findOperationsSummary(req.user as JwtPayload);
  }

  @Get("tickets/:ticketId")
  findTicket(@Param("ticketId") ticketId: string, @Req() req: Request) {
    return this.supportService.findTicket(ticketId, req.user as JwtPayload);
  }

  @Post("tickets")
  createTicket(@Body() dto: CreateSupportTicketDto, @Req() req: Request) {
    return this.supportService.createTicket(dto, req.user as JwtPayload);
  }

  @Post("tickets/:ticketId/comments")
  addComment(
    @Param("ticketId") ticketId: string,
    @Body() dto: CreateSupportTicketCommentDto,
    @Req() req: Request,
  ) {
    return this.supportService.addComment(
      ticketId,
      dto,
      req.user as JwtPayload,
    );
  }

  @Patch("tickets/:ticketId")
  updateTicket(
    @Param("ticketId") ticketId: string,
    @Body() dto: UpdateSupportTicketDto,
    @Req() req: Request,
  ) {
    return this.supportService.updateTicket(
      ticketId,
      dto,
      req.user as JwtPayload,
    );
  }

  @Get("sla-policies")
  findSlaPolicies(@Req() req: Request) {
    return this.supportService.findSlaPolicies(req.user as JwtPayload);
  }

  @Post("sla-policies")
  createSlaPolicy(@Body() dto: CreateSupportSlaPolicyDto, @Req() req: Request) {
    return this.supportService.createSlaPolicy(dto, req.user as JwtPayload);
  }
}
