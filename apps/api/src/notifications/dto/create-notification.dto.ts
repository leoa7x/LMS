import { NotificationChannel } from "@prisma/client";
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateNotificationDto {
  @IsArray()
  @IsString({ each: true })
  recipientUserIds!: string[];

  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(5)
  body!: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  templateId?: string;
}
