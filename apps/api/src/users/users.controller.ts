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
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles("ADMIN", "SUPPORT", "TEACHER")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateUserDto, @Req() req: Request) {
    const actor = req.user as { sub?: string } | undefined;
    return this.usersService.create(dto, actor?.sub);
  }

  @Patch(":id/status")
  @Roles("ADMIN", "SUPPORT")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { sub?: string } | undefined;
    return this.usersService.updateStatus(id, dto, actor?.sub);
  }
}
