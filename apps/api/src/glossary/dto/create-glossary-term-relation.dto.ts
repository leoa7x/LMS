import { IsString } from "class-validator";

export class CreateGlossaryTermRelationDto {
  @IsString()
  glossaryTermId!: string;

  @IsString()
  contentResourceId!: string;
}
