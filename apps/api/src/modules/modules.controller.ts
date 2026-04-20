import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { LangQueryDto } from "../common/dto/lang-query.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateModuleDto } from "./dto/create-module.dto";
import { ModulesService } from "./modules.service";

@Controller("modules")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findAll(@Req() req: Request, @Query() query: LangQueryDto) {
    return this.modulesService.findAll(req.user as JwtPayload, query.lang);
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateModuleDto) {
    return this.modulesService.create(dto);
  }
}
