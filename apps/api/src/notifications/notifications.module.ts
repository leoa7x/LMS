import { Module } from "@nestjs/common";
import { EmailDeliveryService } from "./email-delivery.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailDeliveryService],
})
export class NotificationsModule {}
