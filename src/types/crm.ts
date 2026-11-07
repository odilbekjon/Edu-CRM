// Sahifalar ishlatadigan (UI) turlar. Backend javoblari src/api/mappers.ts orqali shu turlarga o'giriladi.

export type BadgeColor = "blue" | "green" | "amber";

export interface Student {
  id: number;
  name: string;
  phone: string;
  active: boolean;
  /** false — guruhdan chiqarilgan (arxiv) */
  enrolled?: boolean;
  balance?: number;
  joinedAt?: string;
}

export interface Group {
  id: number;
  name: string;
  badge: string;
  badgeColor: BadgeColor;
  startDate: string;
  endDate: string;
  schedule: string;
  room: string;
  roomCapacity?: number;
  studentCount: number;
  students: Student[];
  course: string;
  teacher: string;
  teacherId: number;
  price?: number;
  days: string;
  lessonStartTime: string;
  branch?: string;
  status?: "Active" | "Archive" | "Completed";
  tags?: string[];
}

export interface Teacher {
  id: number;
  fullName: string;
  phone: string;
  telegram?: string;
  uid: string;
  role: string;
  branch: string;
  percent?: string;
  dob?: string;
  gender?: string;
  groups: Group[];
  students?: Student[];
}

export interface FlatStudent {
  /** `${groupId}-${studentId}` — bitta o'quvchi bir nechta guruhda bo'lsa, har biri alohida qator */
  uid: string;
  id: number;
  name: string;
  phone: string;
  active: boolean;
  groupId: number;
  groupName: string;
  groupSchedule: string;
  groupBadge: string;
  groupBadgeColor: BadgeColor;
  course: string;
  teacher: string;
  teacherId: number;
  startDate: string;
  endDate: string;
  branch: string;
  room: string;
  price: number;
  balance: number;
  comment?: string;
}

/** sana: "2026-05-14" -> "14.05.2026" */
export const formatDate = (d: string | null | undefined): string => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
};

export interface Course {
  id: number;
  name: string;
  price: number;
  color: string;
  codeCourse: string;
  lessonDuration: string;
  courseDuration: number;
  description: string;
  students: number;
  groups: Array<{
    id: number;
    tag: string;
    teacher: string;
    startDate: string;
    endDate: string;
    schedule: string;
    time: string;
  }>;
}
