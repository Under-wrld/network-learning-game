-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('QUIZ', 'OPEN_CHALLENGE');

-- CreateEnum
CREATE TYPE "LeaderboardScope" AS ENUM ('GLOBAL', 'CLASSROOM');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "join_code" TEXT NOT NULL,
    "teacher_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_memberships" (
    "id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classroom_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tanenbaum_chapter" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "classroom_id" UUID,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labs" (
    "id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "simulator_key" TEXT NOT NULL,
    "initial_state" JSONB NOT NULL,
    "validation_criteria" JSONB NOT NULL,
    "max_xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_attempts" (
    "id" UUID NOT NULL,
    "lab_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "state" JSONB NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER,
    "xp_awarded" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "lab_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "type" "AssessmentType" NOT NULL DEFAULT 'QUIZ',
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "passing_score" INTEGER NOT NULL,
    "max_xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_attempts" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_quests" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL,
    "criteria" JSONB NOT NULL,
    "active_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_quest_progress" (
    "id" UUID NOT NULL,
    "daily_quest_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "progress" JSONB NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_quest_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon_url" TEXT,
    "trigger_type" TEXT NOT NULL,
    "trigger_criteria" JSONB NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_logs" (
    "id" UUID NOT NULL,
    "achievement_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" UUID NOT NULL,
    "scope" "LeaderboardScope" NOT NULL DEFAULT 'GLOBAL',
    "classroom_id" UUID,
    "user_id" UUID NOT NULL,
    "xp" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_spent_per_module" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "time_spent_per_module_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_total_xp_idx" ON "users"("total_xp");

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_join_code_key" ON "classrooms"("join_code");

-- CreateIndex
CREATE INDEX "classrooms_teacher_id_idx" ON "classrooms"("teacher_id");

-- CreateIndex
CREATE INDEX "classroom_memberships_user_id_idx" ON "classroom_memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_memberships_classroom_id_user_id_key" ON "classroom_memberships"("classroom_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "chapters_course_id_idx" ON "chapters"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_course_id_order_key" ON "chapters"("course_id", "order");

-- CreateIndex
CREATE INDEX "levels_chapter_id_idx" ON "levels"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "levels_chapter_id_order_key" ON "levels"("chapter_id", "order");

-- CreateIndex
CREATE INDEX "course_enrollments_course_id_idx" ON "course_enrollments"("course_id");

-- CreateIndex
CREATE INDEX "course_enrollments_classroom_id_idx" ON "course_enrollments"("classroom_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_user_id_course_id_key" ON "course_enrollments"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "labs_level_id_idx" ON "labs"("level_id");

-- CreateIndex
CREATE INDEX "lab_attempts_lab_id_idx" ON "lab_attempts"("lab_id");

-- CreateIndex
CREATE INDEX "lab_attempts_user_id_started_at_idx" ON "lab_attempts"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "assessments_level_id_idx" ON "assessments"("level_id");

-- CreateIndex
CREATE INDEX "assessment_attempts_assessment_id_idx" ON "assessment_attempts"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_attempts_user_id_started_at_idx" ON "assessment_attempts"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "xp_transactions_user_id_created_at_idx" ON "xp_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "daily_quests_active_date_idx" ON "daily_quests"("active_date");

-- CreateIndex
CREATE INDEX "daily_quest_progress_user_id_idx" ON "daily_quest_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_quest_progress_daily_quest_id_user_id_key" ON "daily_quest_progress"("daily_quest_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

-- CreateIndex
CREATE INDEX "achievement_logs_user_id_idx" ON "achievement_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_logs_achievement_id_user_id_key" ON "achievement_logs"("achievement_id", "user_id");

-- CreateIndex
CREATE INDEX "leaderboard_entries_scope_classroom_id_rank_idx" ON "leaderboard_entries"("scope", "classroom_id", "rank");

-- CreateIndex
CREATE INDEX "leaderboard_entries_user_id_idx" ON "leaderboard_entries"("user_id");

-- CreateIndex
CREATE INDEX "user_activity_logs_user_id_created_at_idx" ON "user_activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "time_spent_per_module_level_id_idx" ON "time_spent_per_module"("level_id");

-- CreateIndex
CREATE UNIQUE INDEX "time_spent_per_module_user_id_level_id_date_key" ON "time_spent_per_module"("user_id", "level_id", "date");

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_memberships" ADD CONSTRAINT "classroom_memberships_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_memberships" ADD CONSTRAINT "classroom_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labs" ADD CONSTRAINT "labs_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_attempts" ADD CONSTRAINT "lab_attempts_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_attempts" ADD CONSTRAINT "lab_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_quest_progress" ADD CONSTRAINT "daily_quest_progress_daily_quest_id_fkey" FOREIGN KEY ("daily_quest_id") REFERENCES "daily_quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_quest_progress" ADD CONSTRAINT "daily_quest_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_logs" ADD CONSTRAINT "achievement_logs_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_logs" ADD CONSTRAINT "achievement_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_spent_per_module" ADD CONSTRAINT "time_spent_per_module_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_spent_per_module" ADD CONSTRAINT "time_spent_per_module_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
