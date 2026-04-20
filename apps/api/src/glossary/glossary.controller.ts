import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { LangQueryDto } from "../common/dto/lang-query.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { CreateGlossaryTermRelationDto } from "./dto/create-glossary-term-relation.dto";
import { CreateGlossaryTermDto } from "./dto/create-glossary-term.dto";
import { GlossaryService } from "./glossary.service";

@Controller("glossary")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "STUDENT", "SUPPORT")
  findAll(@Req() req: Request, @Query() query: LangQueryDto) {
    return this.glossaryService.findAll(req.user as JwtPayload, query.lang);
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateGlossaryTermDto) {
    return this.glossaryService.create(dto);
  }

  @Post("relations")
  @Roles("ADMIN", "TEACHER")
  createRelation(@Body() dto: CreateGlossaryTermRelationDto) {
    return this.glossaryService.createRelation(dto);
  }
}
