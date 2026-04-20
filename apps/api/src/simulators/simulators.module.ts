import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "../academic-visibility/academic-visibility.module";
import { SimulatorsController } from "./simulators.controller";
import { SimulatorsService } from "./simulators.service";

@Module({
  imports: [AcademicVisibilityModule],
  controllers: [SimulatorsController],
  providers: [SimulatorsService],
  exports: [SimulatorsService],
})
export class SimulatorsModule {}
