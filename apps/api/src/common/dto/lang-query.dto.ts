import { IsIn, IsOptional } from "class-validator";

export class LangQueryDto {
  @IsOptional()
  @IsIn(["es", "en"])
  lang?: "es" | "en";
}
