import type { UserProfile } from "@network-learning-game/shared";
import { ClassroomsView } from "@/components/classrooms/classrooms-view";
import { serverApiFetch } from "@/lib/api/server";

interface ClassroomSummary {
  id: string;
  name: string;
  joinCode: string;
  teacherId: string;
  memberCount: number;
}

export default async function ClassroomsPage() {
  const [profile, classrooms] = await Promise.all([
    serverApiFetch<UserProfile>("/users/me"),
    serverApiFetch<ClassroomSummary[]>("/classrooms/mine"),
  ]);

  return <ClassroomsView role={profile.role} classrooms={classrooms} />;
}
