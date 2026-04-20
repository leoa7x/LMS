import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CompleteLessonDto } from "./dto/complete-lesson.dto";
import { CompletePracticeDto } from "./dto/complete-practice.dto";
import { CompleteSegmentDto } from "./dto/complete-segment.dto";
import { ProgressService } from "./progress.service";

@Controller("progress")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAll() {
    return this.progressService.findAll();
  }

  @Get("student/:studentId")
  @Roles("ADMIN", "TEACHER", "STUDENT", "SUPPORT")
  findStudentSummary(@Param("studentId") studentId: string) {
    return this.progressService.findStudentSummary(studentId);
  }

  @Post("lessons/complete")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  completeLesson(@Body() dto: CompleteLessonDto) {
    return this.progressService.completeLesson(dto);
  }

  @Post("segments/complete")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  completeSegment(@Body() dto: CompleteSegmentDto) {
    return this.progressService.completeSegment(dto);
  }

  @Post("practices/complete")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  completePractice(@Body() dto: CompletePracticeDto) {
    return this.progressService.completePractice(dto);
  }
}
