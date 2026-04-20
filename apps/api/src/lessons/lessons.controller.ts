import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { LangQueryDto } from "../common/dto/lang-query.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { LessonsService } from "./lessons.service";

@Controller("lessons")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findAll(@Req() req: Request, @Query() query: LangQueryDto) {
    return this.lessonsService.findAll(req.user as JwtPayload, query.lang);
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateLessonDto) {
    return this.lessonsService.create(dto);
  }
}
