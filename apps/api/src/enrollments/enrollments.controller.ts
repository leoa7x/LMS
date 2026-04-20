import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AssignLearningPathDto } from "./dto/assign-learning-path.dto";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";
import { EnrollmentsService } from "./enrollments.service";

@Controller("enrollments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAll(@Req() req: Request) {
    return this.enrollmentsService.findAll(req.user as JwtPayload);
  }

  @Get("learning-path-assignments")
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findLearningPathAssignments(@Req() req: Request) {
    return this.enrollmentsService.findLearningPathAssignments(req.user as JwtPayload);
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateEnrollmentDto, @Req() req: Request) {
    return this.enrollmentsService.create(dto, req.user as JwtPayload);
  }

  @Post("learning-paths/assign")
  @Roles("ADMIN", "TEACHER")
  assignLearningPath(@Body() dto: AssignLearningPathDto, @Req() req: Request) {
    return this.enrollmentsService.assignLearningPath(dto, req.user as JwtPayload);
  }
}
