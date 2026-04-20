import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("admin")
  @Roles("ADMIN")
  adminSummary(@Req() req: Request) {
    return this.dashboardService.adminSummary(req.user as JwtPayload);
  }

  @Get("teacher")
  @Roles("ADMIN", "TEACHER")
  teacherSummary(@Req() req: Request) {
    return this.dashboardService.teacherSummary(req.user as JwtPayload);
  }

  @Get("student/me")
  @Roles("STUDENT")
  studentSummary(@Req() req: Request) {
    return this.dashboardService.studentSummary(req.user as JwtPayload);
  }
}
