import { EntityStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateEntityStatusDto {
  @IsEnum(EntityStatus)
  status!: EntityStatus;
}
