import type { Course, FlatStudent, Group, Student, Teacher } from "../types/crm";
import type { ApiCourse, ApiGroup, ApiStudent, ApiUser } from "./types";

/** 9 raqamli telefon: "939866676" -> "93 986 66 76" */
export const formatPhone = (p: string): string => {
  const d = p.replace(/\D/g, "");
  return d.length === 9 ? `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}` : p;
};

/** O'quvchi telefoni: "939866676" -> "(93) 986-66-76" */
export const formatStudentPhone = (p: string): string => {
  const d = p.replace(/\D/g, "");
  return d.length === 9 ? `(${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}` : p;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function toGroup(g: ApiGroup): Group {
  return {
    id: g.id,
    name: g.name,
    badge: g.badge,
    badgeColor: g.badgeColor,
    startDate: g.startDate,
    endDate: g.endDate,
    schedule: `${g.days} • ${g.lessonStartTime}`,
    days: g.days,
    lessonStartTime: g.lessonStartTime,
    room: g.room?.name ?? "",
    roomCapacity: g.room?.capacity,
    studentCount: g.studentCount,
    students: g.students.map(
      (s): Student => ({
        id: s.id,
        name: s.fullName,
        phone: formatStudentPhone(s.phone),
        active: s.active,
        enrolled: s.enrolled,
        balance: s.balance,
        joinedAt: s.joinedAt,
      }),
    ),
    course: g.course.name,
    teacher: g.teacher.fullName,
    teacherId: g.teacherId,
    price: g.price,
    branch: g.branch?.name,
    status: g.status,
    tags: g.tags,
  };
}

export function toTeacher(u: ApiUser, groups: Group[]): Teacher {
  return {
    id: u.id,
    fullName: u.fullName,
    phone: formatPhone(u.phone),
    telegram: u.telegram ?? undefined,
    uid: u.uid,
    role: capitalize(u.role),
    branch: u.branch?.name ?? "",
    percent: u.percent != null ? String(u.percent) : undefined,
    dob: u.dob ?? undefined,
    gender: u.gender ?? undefined,
    groups: groups.filter((g) => g.teacherId === u.id),
  };
}

/**
 * Guruhlar va o'quvchilardan tekis ro'yxat: har bir (guruh, o'quvchi) juftligi — bitta qator.
 * Guruhsiz o'quvchilar groupId = 0 bilan qo'shiladi.
 */
export function toFlatStudents(groups: ApiGroup[], students: ApiStudent[]): FlatStudent[] {
  const byId = new Map(students.map((s) => [s.id, s]));
  const seen = new Set<number>();
  const rows: FlatStudent[] = [];

  for (const g of groups) {
    for (const gs of g.students) {
      const s = byId.get(gs.id);
      if (!s || !gs.enrolled) continue; // ko'rinmaydigan yoki guruhdan chiqarilgan o'quvchi
      seen.add(s.id);
      rows.push({
        uid: `${g.id}-${s.id}`,
        id: s.id,
        name: s.fullName,
        phone: formatStudentPhone(s.phone),
        active: gs.active,
        groupId: g.id,
        groupName: g.name,
        groupSchedule: `${g.days} • ${g.lessonStartTime}`,
        groupBadge: g.badge,
        groupBadgeColor: g.badgeColor,
        course: g.course.name,
        teacher: g.teacher.fullName,
        teacherId: g.teacherId,
        startDate: g.startDate,
        endDate: g.endDate,
        branch: g.branch?.name ?? s.branch?.name ?? "",
        room: g.room?.name ?? "",
        price: g.price,
        balance: s.balance,
        comment: s.comment ?? undefined,
      });
    }
  }

  for (const s of students) {
    if (seen.has(s.id)) continue;
    rows.push({
      uid: `0-${s.id}`,
      id: s.id,
      name: s.fullName,
      phone: formatStudentPhone(s.phone),
      active: s.active,
      groupId: 0,
      groupName: "—",
      groupSchedule: "",
      groupBadge: "",
      groupBadgeColor: "blue",
      course: "",
      teacher: "",
      teacherId: 0,
      startDate: "",
      endDate: "",
      branch: s.branch?.name ?? "",
      room: "",
      price: 0,
      balance: s.balance,
      comment: s.comment ?? undefined,
    });
  }
  return rows;
}

/** Form'dagi telefon (har qanday format) -> 9 raqam */
export const phoneDigits = (p: string): string => {
  const d = p.replace(/\D/g, "");
  return d.length > 9 && d.startsWith("998") ? d.slice(3) : d;
};

export function toCourse(c: ApiCourse): Course {
  return {
    id: c.id,
    name: c.name,
    price: c.price,
    color: c.color,
    codeCourse: c.code ?? "",
    lessonDuration: c.lessonDuration,
    courseDuration: c.courseDuration,
    description: c.description,
    students: c.students,
    groups: c.groups.map((g) => ({
      id: g.id,
      tag: g.name,
      teacher: g.teacher.fullName,
      startDate: g.startDate.split("-").reverse().join("."),
      endDate: g.endDate.split("-").reverse().join("."),
      schedule: g.days,
      time: g.lessonStartTime,
    })),
  };
}
