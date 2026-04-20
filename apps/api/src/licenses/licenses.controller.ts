import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
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
  findAll(@Req() req: Request) {
    return this.licensesService.findAll(req.user as JwtPayload);
  }

  @Get("contracts")
  @Roles("ADMIN", "SUPPORT")
  findAllContracts(@Req() req: Request) {
    return this.licensesService.findAllContracts(req.user as JwtPayload);
  }

  @Post("contracts")
  @Roles("ADMIN")
  createContractTerm(@Body() dto: CreateContractTermDto, @Req() req: Request) {
    return this.licensesService.createContractTerm(dto, req.user as JwtPayload);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateLicenseDto, @Req() req: Request) {
    return this.licensesService.create(dto, req.user as JwtPayload);
  }
}
