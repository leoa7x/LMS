import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateContentResourceDto } from "./dto/create-content-resource.dto";
import { ContentResourcesService } from "./content-resources.service";

@Controller("content-resources")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentResourcesController {
  constructor(private readonly contentResourcesService: ContentResourcesService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAll() {
    return this.contentResourcesService.findAll();
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateContentResourceDto) {
    return this.contentResourcesService.create(dto);
  }
}
