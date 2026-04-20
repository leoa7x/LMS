import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateContractTermDto } from "./dto/create-contract-term.dto";
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

  @Get("contracts")
  @Roles("ADMIN", "SUPPORT")
  findAllContracts() {
    return this.licensesService.findAllContracts();
  }

  @Post("contracts")
  @Roles("ADMIN")
  createContractTerm(@Body() dto: CreateContractTermDto) {
    return this.licensesService.createContractTerm(dto);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateLicenseDto) {
    return this.licensesService.create(dto);
  }
}
