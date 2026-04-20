import { Module } from "@nestjs/common";
import { CertificationTracksController } from "./certification-tracks.controller";
import { CertificationTracksService } from "./certification-tracks.service";

@Module({
  controllers: [CertificationTracksController],
  providers: [CertificationTracksService],
})
export class CertificationTracksModule {}
