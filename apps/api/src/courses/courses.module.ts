import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "../academic-visibility/academic-visibility.module";
import { I18nModule } from "../i18n/i18n.module";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";

@Module({
  imports: [AcademicVisibilityModule, I18nModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
