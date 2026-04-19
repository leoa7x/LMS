import { Module } from "@nestjs/common";
import { TechnicalAreasController } from "./technical-areas.controller";
import { TechnicalAreasService } from "./technical-areas.service";

@Module({
  controllers: [TechnicalAreasController],
  providers: [TechnicalAreasService],
  exports: [TechnicalAreasService],
})
export class TechnicalAreasModule {}
