import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateLessonSegmentDto } from "./dto/create-lesson-segment.dto";
import { LessonSegmentsService } from "./lesson-segments.service";

@Controller("lesson-segments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonSegmentsController {
  constructor(private readonly lessonSegmentsService: LessonSegmentsService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAll() {
    return this.lessonSegmentsService.findAll();
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateLessonSegmentDto) {
    return this.lessonSegmentsService.create(dto);
  }
}
