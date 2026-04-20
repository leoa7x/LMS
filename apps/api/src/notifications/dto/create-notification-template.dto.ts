import { NotificationChannel } from "@prisma/client";
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class CreateNotificationTemplateDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsString()
  @MinLength(3)
  subjectEs!: string;

  @IsOptional()
  @IsString()
  subjectEn?: string;

  @IsString()
  @MinLength(5)
  bodyEs!: string;

  @IsOptional()
  @IsString()
  bodyEn?: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
