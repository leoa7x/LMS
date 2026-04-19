import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateCourseDto } from "./dto/create-course.dto";
import { CoursesService } from "./courses.service";

@Controller("courses")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAll() {
    return this.coursesService.findAll();
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }
}
