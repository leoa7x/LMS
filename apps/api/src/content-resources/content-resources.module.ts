import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "../academic-visibility/academic-visibility.module";
import { I18nModule } from "../i18n/i18n.module";
import { ContentResourcesController } from "./content-resources.controller";
import { ContentResourcesService } from "./content-resources.service";

@Module({
  imports: [AcademicVisibilityModule, I18nModule],
  controllers: [ContentResourcesController],
  providers: [ContentResourcesService],
  exports: [ContentResourcesService],
})
export class ContentResourcesModule {}
