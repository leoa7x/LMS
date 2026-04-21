import { VoiceoverSourceKind, VoiceoverStatus } from "@prisma/client";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class CreateContentVoiceoverTrackDto {
  @IsOptional()
  @IsString()
  contentResourceId?: string;

  @IsOptional()
  @IsString()
  lessonSegmentId?: string;

  @IsString()
  language!: string;

  @IsEnum(VoiceoverSourceKind)
  sourceKind!: VoiceoverSourceKind;

  @IsOptional()
  @IsEnum(VoiceoverStatus)
  status?: VoiceoverStatus;

  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  transcriptEs?: string;

  @IsOptional()
  @IsString()
  transcriptEn?: string;

  @IsOptional()
  @IsString()
  audioUri?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}
