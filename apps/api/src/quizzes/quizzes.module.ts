import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "../academic-visibility/academic-visibility.module";
import { I18nModule } from "../i18n/i18n.module";
import { QuizzesController } from "./quizzes.controller";
import { QuizzesService } from "./quizzes.service";

@Module({
  imports: [AcademicVisibilityModule, I18nModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
