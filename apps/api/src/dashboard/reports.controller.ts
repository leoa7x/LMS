import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { DashboardService } from "./dashboard.service";

@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("courses/:courseId/summary")
  @Roles("ADMIN", "TEACHER")
  courseSummary(@Param("courseId") courseId: string, @Req() req: Request) {
    return this.dashboardService.courseSummary(
      courseId,
      req.user as JwtPayload,
    );
  }

  @Get("students/:studentId/summary")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  studentSummary(@Param("studentId") studentId: string, @Req() req: Request) {
    return this.dashboardService.studentReportSummary(
      studentId,
      req.user as JwtPayload,
    );
  }

  @Get("enrollments/:enrollmentId/result")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  enrollmentResult(
    @Param("enrollmentId") enrollmentId: string,
    @Req() req: Request,
  ) {
    return this.dashboardService.enrollmentResult(
      enrollmentId,
      req.user as JwtPayload,
    );
  }

  @Get("learning-path-assignments/:assignmentId/result")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  learningPathResult(
    @Param("assignmentId") assignmentId: string,
    @Req() req: Request,
  ) {
    return this.dashboardService.learningPathResult(
      assignmentId,
      req.user as JwtPayload,
    );
  }
}
