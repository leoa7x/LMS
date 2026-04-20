import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "../academic-visibility/academic-visibility.module";
import { I18nModule } from "../i18n/i18n.module";
import { PracticesController } from "./practices.controller";
import { PracticesService } from "./practices.service";

@Module({
  imports: [AcademicVisibilityModule, I18nModule],
  controllers: [PracticesController],
  providers: [PracticesService],
  exports: [PracticesService],
})
export class PracticesModule {}
