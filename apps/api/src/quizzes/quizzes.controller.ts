import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Query } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { LangQueryDto } from "../common/dto/lang-query.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { GrantQuizRetakeDto } from "./dto/grant-quiz-retake.dto";
import { SubmitQuizAttemptDto } from "./dto/submit-quiz-attempt.dto";
import { QuizzesService } from "./quizzes.service";

@Controller("quizzes")
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findAll(@Req() req: Request, @Query() query: LangQueryDto) {
    return this.quizzesService.findAll(req.user as JwtPayload, query.lang);
  }

  @Post()
  @Roles("ADMIN", "TEACHER")
  createQuiz(@Body() dto: CreateQuizDto) {
    return this.quizzesService.createQuiz(dto);
  }

  @Post("questions")
  @Roles("ADMIN", "TEACHER")
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.quizzesService.createQuestion(dto);
  }

  @Get("attempts")
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findAttempts() {
    return this.quizzesService.findAttempts();
  }

  @Get("retake-grants")
  @Roles("ADMIN", "TEACHER", "SUPPORT")
  findRetakeGrants() {
    return this.quizzesService.findRetakeGrants();
  }

  @Post("attempts")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  submitAttempt(@Body() dto: SubmitQuizAttemptDto) {
    return this.quizzesService.submitAttempt(dto);
  }

  @Post("retake-grants")
  @Roles("ADMIN", "TEACHER")
  grantRetake(@Body() dto: GrantQuizRetakeDto) {
    return this.quizzesService.grantRetake(dto);
  }
}
