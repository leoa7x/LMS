import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
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
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get("learning-path-assignments")
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findLearningPathAssignments() {
    return this.enrollmentsService.findLearningPathAssignments();
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Post("learning-paths/assign")
  @Roles("ADMIN", "TEACHER")
  assignLearningPath(@Body() dto: AssignLearningPathDto) {
    return this.enrollmentsService.assignLearningPath(dto);
  }
}
