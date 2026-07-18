import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import {
  CreateClassroomSchema,
  JoinClassroomSchema,
  type CreateClassroom,
  type JoinClassroom,
} from "@network-learning-game/shared";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { CurrentUser } from "../auth/infrastructure/current-user.decorator.js";
import { SupabaseAuthGuard } from "../auth/infrastructure/supabase-auth.guard.js";
import type { AuthenticatedUser } from "../auth/domain/authenticated-user.js";
import { CreateClassroomUseCase } from "./application/create-classroom.use-case.js";
import { JoinClassroomUseCase } from "./application/join-classroom.use-case.js";
import { ListMyClassroomsUseCase } from "./application/list-my-classrooms.use-case.js";
import type { ClassroomSummary } from "./domain/classroom.js";

@Controller("classrooms")
@UseGuards(SupabaseAuthGuard)
export class ClassroomController {
  constructor(
    private readonly createClassroom: CreateClassroomUseCase,
    private readonly joinClassroom: JoinClassroomUseCase,
    private readonly listMyClassrooms: ListMyClassroomsUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("TEACHER")
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateClassroomSchema)) body: CreateClassroom,
  ): Promise<ClassroomSummary> {
    return this.createClassroom.execute(user.id, body.name);
  }

  @Post("join")
  join(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(JoinClassroomSchema)) body: JoinClassroom,
  ): Promise<ClassroomSummary> {
    return this.joinClassroom.execute(user.id, body.joinCode);
  }

  @Get("mine")
  mine(@CurrentUser() user: AuthenticatedUser): Promise<ClassroomSummary[]> {
    return this.listMyClassrooms.execute(user.id, user.role);
  }
}
