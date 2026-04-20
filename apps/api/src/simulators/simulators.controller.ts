import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateSimulatorMappingDto } from "./dto/create-simulator-mapping.dto";
import { CreateSimulatorDto } from "./dto/create-simulator.dto";
import { CreateSimulatorSessionDto } from "./dto/create-simulator-session.dto";
import { CompleteSimulatorSessionDto } from "./dto/complete-simulator-session.dto";
import { LogSimulatorSessionEventDto } from "./dto/log-simulator-session-event.dto";
import { SimulatorsService } from "./simulators.service";

@Controller("simulators")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SimulatorsController {
  constructor(private readonly simulatorsService: SimulatorsService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findAll(@Req() req: Request) {
    return this.simulatorsService.findAll(req.user as JwtPayload);
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateSimulatorDto) {
    return this.simulatorsService.create(dto);
  }

  @Get("mappings")
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findMappings(@Req() req: Request) {
    return this.simulatorsService.findMappings(req.user as JwtPayload);
  }

  @Post("mappings")
  @Roles("ADMIN", "TEACHER")
  createMapping(@Body() dto: CreateSimulatorMappingDto) {
    return this.simulatorsService.createMapping(dto);
  }

  @Get("sessions")
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findSessions(@Req() req: Request) {
    return this.simulatorsService.findSessions(req.user as JwtPayload);
  }

  @Post("sessions")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  createSession(@Body() dto: CreateSimulatorSessionDto, @Req() req: Request) {
    return this.simulatorsService.createSession(dto, req.user as JwtPayload);
  }

  @Get("sessions/:sessionId/context")
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  getSessionContext(@Param("sessionId") sessionId: string, @Req() req: Request) {
    return this.simulatorsService.getSessionContext(sessionId, req.user as JwtPayload);
  }

  @Post("sessions/events")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  logSessionEvent(@Body() dto: LogSimulatorSessionEventDto, @Req() req: Request) {
    return this.simulatorsService.logSessionEvent(dto, req.user as JwtPayload);
  }

  @Post("sessions/complete")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  completeSession(@Body() dto: CompleteSimulatorSessionDto, @Req() req: Request) {
    return this.simulatorsService.completeSession(dto, req.user as JwtPayload);
  }
}
