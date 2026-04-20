import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "../academic-visibility/academic-visibility.module";
import { I18nModule } from "../i18n/i18n.module";
import { LessonsController } from "./lessons.controller";
import { LessonsService } from "./lessons.service";

@Module({
  imports: [AcademicVisibilityModule, I18nModule],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
