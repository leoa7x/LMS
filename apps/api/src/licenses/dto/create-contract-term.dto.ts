import { IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateContractTermDto {
  @IsString()
  institutionId!: string;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  concurrentCap?: number;
}
