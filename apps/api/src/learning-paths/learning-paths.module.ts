import { Module } from "@nestjs/common";
import { I18nModule } from "../i18n/i18n.module";
import { LearningPathsController } from "./learning-paths.controller";
import { LearningPathsService } from "./learning-paths.service";

@Module({
  imports: [I18nModule],
  controllers: [LearningPathsController],
  providers: [LearningPathsService],
})
export class LearningPathsModule {}
