import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
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
  findAll() {
    return this.certificationTracksService.findAll();
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
}
