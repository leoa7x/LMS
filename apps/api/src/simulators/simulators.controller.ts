import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateSimulatorMappingDto } from "./dto/create-simulator-mapping.dto";
import { CreateSimulatorDto } from "./dto/create-simulator.dto";
import { CreateSimulatorSessionDto } from "./dto/create-simulator-session.dto";
import { CompleteSimulatorSessionDto } from "./dto/complete-simulator-session.dto";
import { SimulatorsService } from "./simulators.service";

@Controller("simulators")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SimulatorsController {
  constructor(private readonly simulatorsService: SimulatorsService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findAll() {
    return this.simulatorsService.findAll();
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateSimulatorDto) {
    return this.simulatorsService.create(dto);
  }

  @Get("mappings")
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findMappings() {
    return this.simulatorsService.findMappings();
  }

  @Post("mappings")
  @Roles("ADMIN", "TEACHER")
  createMapping(@Body() dto: CreateSimulatorMappingDto) {
    return this.simulatorsService.createMapping(dto);
  }

  @Get("sessions")
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findSessions() {
    return this.simulatorsService.findSessions();
  }

  @Post("sessions")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  createSession(@Body() dto: CreateSimulatorSessionDto) {
    return this.simulatorsService.createSession(dto);
  }

  @Post("sessions/complete")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  completeSession(@Body() dto: CompleteSimulatorSessionDto) {
    return this.simulatorsService.completeSession(dto);
  }
}
