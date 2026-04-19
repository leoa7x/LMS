import { Module } from "@nestjs/common";
import { ContentResourcesController } from "./content-resources.controller";
import { ContentResourcesService } from "./content-resources.service";

@Module({
  controllers: [ContentResourcesController],
  providers: [ContentResourcesService],
  exports: [ContentResourcesService],
})
export class ContentResourcesModule {}
