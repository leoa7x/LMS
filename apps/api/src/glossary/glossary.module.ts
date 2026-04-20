import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "../academic-visibility/academic-visibility.module";
import { I18nModule } from "../i18n/i18n.module";
import { GlossaryController } from "./glossary.controller";
import { GlossaryService } from "./glossary.service";

@Module({
  imports: [AcademicVisibilityModule, I18nModule],
  controllers: [GlossaryController],
  providers: [GlossaryService],
  exports: [GlossaryService],
})
export class GlossaryModule {}
