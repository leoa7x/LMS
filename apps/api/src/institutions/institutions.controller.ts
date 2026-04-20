import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateCampusDto } from "./dto/create-campus.dto";
import { CreateInstitutionDto } from "./dto/create-institution.dto";
import { CreateLaboratoryDto } from "./dto/create-laboratory.dto";
import { UpdateEntityStatusDto } from "./dto/update-entity-status.dto";
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

  @Get("campuses/all")
  @Roles("ADMIN", "SUPPORT")
  findCampuses() {
    return this.institutionsService.findCampuses();
  }

  @Post("campuses")
  @Roles("ADMIN")
  createCampus(@Body() dto: CreateCampusDto) {
    return this.institutionsService.createCampus(dto);
  }

  @Patch("campuses/:id/status")
  @Roles("ADMIN")
  updateCampusStatus(@Param("id") id: string, @Body() dto: UpdateEntityStatusDto) {
    return this.institutionsService.updateCampusStatus(id, dto);
  }

  @Get("laboratories/all")
  @Roles("ADMIN", "SUPPORT")
  findLaboratories() {
    return this.institutionsService.findLaboratories();
  }

  @Post("laboratories")
  @Roles("ADMIN")
  createLaboratory(@Body() dto: CreateLaboratoryDto) {
    return this.institutionsService.createLaboratory(dto);
  }

  @Patch("laboratories/:id/status")
  @Roles("ADMIN")
  updateLaboratoryStatus(
    @Param("id") id: string,
    @Body() dto: UpdateEntityStatusDto,
  ) {
    return this.institutionsService.updateLaboratoryStatus(id, dto);
  }

  @Get(":id")
  @Roles("ADMIN", "SUPPORT")
  findOne(@Param("id") id: string) {
    return this.institutionsService.findOne(id);
  }

  @Patch(":id/status")
  @Roles("ADMIN")
  updateInstitutionStatus(
    @Param("id") id: string,
    @Body() dto: UpdateEntityStatusDto,
  ) {
    return this.institutionsService.updateInstitutionStatus(id, dto);
  }
}
