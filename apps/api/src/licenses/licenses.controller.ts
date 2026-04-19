import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateLicenseDto } from "./dto/create-license.dto";
import { LicensesService } from "./licenses.service";

@Controller("licenses")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get()
  @Roles("ADMIN", "SUPPORT")
  findAll() {
    return this.licensesService.findAll();
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateLicenseDto) {
    return this.licensesService.create(dto);
  }
}
