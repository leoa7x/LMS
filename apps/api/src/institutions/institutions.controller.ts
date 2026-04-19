import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateInstitutionDto } from "./dto/create-institution.dto";
import { InstitutionsService } from "./institutions.service";

@Controller("institutions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @Roles("ADMIN", "SUPPORT")
  findAll() {
    return this.institutionsService.findAll();
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateInstitutionDto) {
    return this.institutionsService.create(dto);
  }
}
