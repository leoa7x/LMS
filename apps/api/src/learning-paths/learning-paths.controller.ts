import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AddLearningPathCourseDto } from "./dto/add-learning-path-course.dto";
import { CreateLearningPathDto } from "./dto/create-learning-path.dto";
import { LearningPathsService } from "./learning-paths.service";

@Controller("learning-paths")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAll() {
    return this.learningPathsService.findAll();
  }

  @Get("assignments/:assignmentId/sequence")
  @Roles("ADMIN", "TEACHER", "STUDENT", "SUPPORT")
  assignmentSequence(@Param("assignmentId") assignmentId: string, @Req() req: Request) {
    return this.learningPathsService.assignmentSequence(
      assignmentId,
      req.user as JwtPayload,
    );
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateLearningPathDto) {
    return this.learningPathsService.create(dto);
  }

  @Post("courses")
  @Roles("ADMIN", "TEACHER")
  addCourse(@Body() dto: AddLearningPathCourseDto) {
    return this.learningPathsService.addCourse(dto);
  }
}
