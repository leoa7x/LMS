import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { ReportsController } from "./reports.controller";

@Module({
  controllers: [DashboardController, ReportsController],
  providers: [DashboardService],
})
export class DashboardModule {}
