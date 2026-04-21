import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "../academic-visibility/academic-visibility.module";
import { DashboardModule } from "../dashboard/dashboard.module";
import { CertificationTracksController } from "./certification-tracks.controller";
import { CertificationTracksService } from "./certification-tracks.service";

@Module({
  imports: [AcademicVisibilityModule, DashboardModule],
  controllers: [CertificationTracksController],
  providers: [CertificationTracksService],
})
export class CertificationTracksModule {}
