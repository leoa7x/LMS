import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { LangQueryDto } from "../common/dto/lang-query.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreatePracticeDto } from "./dto/create-practice.dto";
import { PracticesService } from "./practices.service";

@Controller("practices")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findAll(@Req() req: Request, @Query() query: LangQueryDto) {
    return this.practicesService.findAll(req.user as JwtPayload, query.lang);
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreatePracticeDto) {
    return this.practicesService.create(dto);
  }
}
