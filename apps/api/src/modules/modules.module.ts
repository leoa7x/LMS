import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "../academic-visibility/academic-visibility.module";
import { I18nModule } from "../i18n/i18n.module";
import { ModulesController } from "./modules.controller";
import { ModulesService } from "./modules.service";

@Module({
  imports: [AcademicVisibilityModule, I18nModule],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}
