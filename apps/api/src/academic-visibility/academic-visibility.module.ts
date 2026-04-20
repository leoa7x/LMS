import { Module } from "@nestjs/common";
import { AcademicVisibilityService } from "./academic-visibility.service";

@Module({
  providers: [AcademicVisibilityService],
  exports: [AcademicVisibilityService],
})
export class AcademicVisibilityModule {}
