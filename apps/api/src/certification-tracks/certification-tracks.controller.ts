import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { AddCertificationTrackCourseDto } from "./dto/add-certification-track-course.dto";
import { CertificationTracksService } from "./certification-tracks.service";
import { CreateCertificationTrackDto } from "./dto/create-certification-track.dto";

@Controller("certification-tracks")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificationTracksController {
  constructor(
    private readonly certificationTracksService: CertificationTracksService,
  ) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAll(@Req() req: Request) {
    return this.certificationTracksService.findAll(req.user as JwtPayload);
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateCertificationTrackDto) {
    return this.certificationTracksService.create(dto);
  }

  @Post("courses")
  @Roles("ADMIN", "TEACHER")
  addCourse(@Body() dto: AddCertificationTrackCourseDto) {
    return this.certificationTracksService.addCourse(dto);
  }

  @Get(":trackId/students/:studentId/status")
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  getStudentStatus(
    @Param("trackId") trackId: string,
    @Param("studentId") studentId: string,
    @Req() req: Request,
  ) {
    return this.certificationTracksService.getStudentStatus(
      trackId,
      studentId,
      req.user as JwtPayload,
    );
  }

  @Get(":trackId/statuses")
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  listTrackStatuses(@Param("trackId") trackId: string, @Req() req: Request) {
    return this.certificationTracksService.listTrackStatuses(
      trackId,
      req.user as JwtPayload,
    );
  }
}
