import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateGlossaryTermDto } from "./dto/create-glossary-term.dto";
import { GlossaryService } from "./glossary.service";

@Controller("glossary")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "STUDENT", "SUPPORT")
  findAll() {
    return this.glossaryService.findAll();
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateGlossaryTermDto) {
    return this.glossaryService.create(dto);
  }
}
