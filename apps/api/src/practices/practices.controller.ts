import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
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
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAll() {
    return this.practicesService.findAll();
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreatePracticeDto) {
    return this.practicesService.create(dto);
  }
}
