import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("ADMIN", "SUPPORT", "TEACHER")
  findAll(@Req() req: Request) {
    return this.usersService.findAll(req.user as JwtPayload);
  }

  @Get(":id")
  @Roles("ADMIN", "SUPPORT", "TEACHER")
  findOne(@Param("id") id: string, @Req() req: Request) {
    return this.usersService.findOne(id, req.user as JwtPayload);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateUserDto, @Req() req: Request) {
    const actor = req.user as JwtPayload | undefined;
    return this.usersService.create(dto, actor);
  }

  @Patch(":id/status")
  @Roles("ADMIN", "SUPPORT")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: Request,
  ) {
    const actor = req.user as JwtPayload | undefined;
    return this.usersService.updateStatus(id, dto, actor);
  }
}
