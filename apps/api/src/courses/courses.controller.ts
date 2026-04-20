import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { LangQueryDto } from "../common/dto/lang-query.dto";
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
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findAll(@Req() req: Request, @Query() query: LangQueryDto) {
    return this.coursesService.findAll(req.user as JwtPayload, query.lang);
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }
}
