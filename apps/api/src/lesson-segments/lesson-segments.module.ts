import { Module } from "@nestjs/common";
import { LessonSegmentsController } from "./lesson-segments.controller";
import { LessonSegmentsService } from "./lesson-segments.service";

@Module({
  controllers: [LessonSegmentsController],
  providers: [LessonSegmentsService],
})
export class LessonSegmentsModule {}
