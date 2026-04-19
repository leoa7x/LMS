import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateTechnicalAreaDto } from "./dto/create-technical-area.dto";
import { TechnicalAreasService } from "./technical-areas.service";

@Controller("technical-areas")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TechnicalAreasController {
  constructor(private readonly technicalAreasService: TechnicalAreasService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAll() {
    return this.technicalAreasService.findAll();
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateTechnicalAreaDto) {
    return this.technicalAreasService.create(dto);
  }
}
