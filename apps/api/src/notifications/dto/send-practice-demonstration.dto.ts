import { IsArray, IsOptional, IsString, MinLength } from "class-validator";

export class SendPracticeDemonstrationDto {
  @IsString()
  practiceId!: string;

  @IsArray()
  @IsString({ each: true })
  recipientUserIds!: string[];

  @IsOptional()
  @IsString()
  @MinLength(3)
  subject?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  message?: string;
}
