import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("admin")
  @Roles("ADMIN")
  adminSummary() {
    return this.dashboardService.adminSummary();
  }

  @Get("teacher")
  @Roles("ADMIN", "TEACHER")
  teacherSummary() {
    return this.dashboardService.teacherSummary();
  }

  @Get("student/:studentId")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  studentSummary(@Param("studentId") studentId: string) {
    return this.dashboardService.studentSummary(studentId);
  }
}
