import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { Response } from "express";
import { LangQueryDto } from "../common/dto/lang-query.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { CreateContentResourceDto } from "./dto/create-content-resource.dto";
import { CreateContentResourceVersionDto } from "./dto/create-content-resource-version.dto";
import { CreateContentVoiceoverTrackDto } from "./dto/create-content-voiceover-track.dto";
import { CreateInteractiveContentConfigDto } from "./dto/create-interactive-content-config.dto";
import { CreateModulePdfExportTemplateDto } from "./dto/create-module-pdf-export-template.dto";
import { ModulePdfExportQueryDto } from "./dto/module-pdf-export-query.dto";
import { ContentResourcesService } from "./content-resources.service";

@Controller("content-resources")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentResourcesController {
  constructor(private readonly contentResourcesService: ContentResourcesService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findAll(@Req() req: Request, @Query() query: LangQueryDto) {
    return this.contentResourcesService.findAll(
      req.user as JwtPayload,
      query.lang,
    );
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  create(@Body() dto: CreateContentResourceDto) {
    return this.contentResourcesService.create(dto);
  }

  @Post("versions")
  @Roles("ADMIN", "TEACHER")
  createVersion(@Body() dto: CreateContentResourceVersionDto) {
    return this.contentResourcesService.createVersion(dto);
  }

  @Get("voiceovers")
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findVoiceoverTracks(@Req() req: Request, @Query() query: LangQueryDto) {
    return this.contentResourcesService.findVoiceoverTracks(
      req.user as JwtPayload,
      query.lang,
    );
  }

  @Post("voiceovers")
  @Roles("ADMIN", "TEACHER")
  createVoiceoverTrack(@Body() dto: CreateContentVoiceoverTrackDto) {
    return this.contentResourcesService.createVoiceoverTrack(dto);
  }

  @Get("interactive-configs")
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findInteractiveConfigs(@Req() req: Request, @Query() query: LangQueryDto) {
    return this.contentResourcesService.findInteractiveConfigs(
      req.user as JwtPayload,
      query.lang,
    );
  }

  @Post("interactive-configs")
  @Roles("ADMIN", "TEACHER")
  createInteractiveConfig(@Body() dto: CreateInteractiveContentConfigDto) {
    return this.contentResourcesService.createInteractiveConfig(dto);
  }

  @Get("pdf-templates")
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findPdfTemplates() {
    return this.contentResourcesService.findPdfTemplates();
  }

  @Post("pdf-templates")
  @Roles("ADMIN", "TEACHER")
  createPdfTemplate(@Body() dto: CreateModulePdfExportTemplateDto) {
    return this.contentResourcesService.createPdfTemplate(dto);
  }

  @Get("modules/:moduleId/pdf-export")
  @Roles("ADMIN", "TEACHER", "STUDENT", "SUPPORT")
  async exportModulePdf(
    @Param("moduleId") moduleId: string,
    @Req() req: Request,
    @Query() query: ModulePdfExportQueryDto,
    @Res() res: Response,
  ) {
    const pdf = await this.contentResourcesService.exportModulePdf(
      moduleId,
      req.user as JwtPayload,
      query,
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdf.filename}"`,
    );

    res.send(pdf.buffer);
  }
}
