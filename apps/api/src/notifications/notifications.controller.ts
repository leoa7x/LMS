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
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { CreateNotificationTemplateDto } from "./dto/create-notification-template.dto";
import { SendPracticeDemonstrationDto } from "./dto/send-practice-demonstration.dto";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("mine")
  findMine(@Req() req: Request) {
    return this.notificationsService.findMine(req.user as JwtPayload);
  }

  @Patch(":notificationId/read")
  markAsRead(@Param("notificationId") notificationId: string, @Req() req: Request) {
    return this.notificationsService.markAsRead(
      notificationId,
      req.user as JwtPayload,
    );
  }

  @Get("templates")
  findTemplates(@Req() req: Request) {
    return this.notificationsService.findTemplates(req.user as JwtPayload);
  }

  @Post("templates")
  createTemplate(@Body() dto: CreateNotificationTemplateDto, @Req() req: Request) {
    return this.notificationsService.createTemplate(
      dto,
      req.user as JwtPayload,
    );
  }

  @Post()
  createNotification(@Body() dto: CreateNotificationDto, @Req() req: Request) {
    return this.notificationsService.createNotification(
      dto,
      req.user as JwtPayload,
    );
  }

  @Post("practice-demonstrations")
  sendPracticeDemonstration(
    @Body() dto: SendPracticeDemonstrationDto,
    @Req() req: Request,
  ) {
    return this.notificationsService.sendPracticeDemonstration(
      dto,
      req.user as JwtPayload,
    );
  }
}
