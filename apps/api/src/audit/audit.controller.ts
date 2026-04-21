import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { AuditService } from "./audit.service";
import { FindAccessEventsQueryDto } from "./dto/find-access-events-query.dto";
import { FindAccessSessionsQueryDto } from "./dto/find-access-sessions-query.dto";
import { FindAuditQueryDto } from "./dto/find-audit-query.dto";

@Controller("audit")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles("ADMIN", "SUPPORT")
  findAll(@Req() req: Request, @Query() query: FindAuditQueryDto) {
    return this.auditService.findAll(req.user as JwtPayload, query);
  }

  @Get("access-events")
  @Roles("ADMIN", "SUPPORT")
  findAccessEvents(@Req() req: Request, @Query() query: FindAccessEventsQueryDto) {
    return this.auditService.findAccessEvents(req.user as JwtPayload, query);
  }

  @Get("access-sessions")
  @Roles("ADMIN", "SUPPORT")
  findAccessSessions(
    @Req() req: Request,
    @Query() query: FindAccessSessionsQueryDto,
  ) {
    return this.auditService.findAccessSessions(req.user as JwtPayload, query);
  }

  @Get("access-operations-summary")
  @Roles("ADMIN", "SUPPORT")
  accessOperationsSummary(@Req() req: Request) {
    return this.auditService.accessOperationsSummary(req.user as JwtPayload);
  }
}
