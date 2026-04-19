import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { SubmitQuizAttemptDto } from "./dto/submit-quiz-attempt.dto";
import { QuizzesService } from "./quizzes.service";

@Controller("quizzes")
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  @Roles("ADMIN", "TEACHER", "SUPPORT", "STUDENT")
  findAll() {
    return this.quizzesService.findAll();
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

  @Post("attempts")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  submitAttempt(@Body() dto: SubmitQuizAttemptDto) {
    return this.quizzesService.submitAttempt(dto);
  }
}
