import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
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

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }
}
