/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  catalogApi, errorMessage, groupsApi, paymentsApi, phoneDigits, studentsApi, toFlatStudents, toGroup, toTeacher, usersApi,
  type ApiBranch, type ApiCourse, type ApiGroup, type ApiRoom, type ApiStudent, type ApiUser,
} from "../../api";
import type { BadgeColor, FlatStudent, Group, Teacher } from "../../types/crm";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";

/* ───────── Form turlari (sahifalar shularni yuboradi) ───────── */

export interface TeacherForm {
  fullName: string;
  phone: string;
  telegram?: string;
  password?: string;
  percent?: string;
  dob?: string;
  gender?: string;
  /** Filial NOMI */
  branch?: string;
}

export interface GroupForm {
  name: string;
  badge?: string;
  badgeColor?: BadgeColor;
  startDate: string;
  endDate: string;
  days: string;
  lessonStartTime: string;
  price?: number;
  status?: "Active" | "Archive" | "Completed";
  tags?: string[];
  /** Nomlar bo'yicha — context id'ga o'giradi */
  course: string;
  teacherId: number;
  room?: string;
  branch?: string;
}

export interface StudentForm {
  name: string;
  phone: string;
  dob?: string;
  gender?: string;
  comment?: string;
  password?: string;
  groupId?: number;
  active?: boolean;
  branch?: string;
}

export interface PaymentForm {
  studentId: number;
  amount: number;
  method?: string;
  date?: string;
  comment?: string;
}

interface DataContextValue {
  loading: boolean;
  /** Birinchi yuklanishdagi xato (server ishlamayotgan bo'lishi mumkin) */
  loadError: string | null;
  refresh: () => Promise<void>;

  teachers: Teacher[];
  groups: Group[];
  students: FlatStudent[];
  apiGroups: ApiGroup[];
  apiStudents: ApiStudent[];
  staff: ApiUser[];
  courses: ApiCourse[];
  rooms: ApiRoom[];
  branches: ApiBranch[];

  // Hamma amallar xatoni toast bilan ko'rsatadi va muvaffaqiyat haqida boolean qaytaradi
  createTeacher: (f: TeacherForm) => Promise<boolean>;
  updateTeacher: (id: number, f: Partial<TeacherForm>) => Promise<boolean>;
  deleteTeacher: (id: number) => Promise<boolean>;

  createGroup: (f: GroupForm) => Promise<boolean>;
  updateGroup: (id: number, f: Partial<GroupForm>) => Promise<boolean>;
  deleteGroup: (id: number) => Promise<boolean>;
  addStudentToGroup: (groupId: number, studentId: number) => Promise<boolean>;
  removeStudentFromGroup: (groupId: number, studentId: number) => Promise<boolean>;

  createStudent: (f: StudentForm) => Promise<boolean>;
  updateStudent: (id: number, f: Partial<StudentForm>) => Promise<boolean>;
  deleteStudents: (ids: number[]) => Promise<boolean>;

  addPayment: (f: PaymentForm) => Promise<boolean>;

  /** Istalgan API amalini bajaradi, xatoni toast qiladi va ma'lumotlarni yangilaydi */
  mutate: (action: () => Promise<unknown>, success?: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);
  const [apiStudents, setApiStudents] = useState<ApiStudent[]>([]);
  const [staff, setStaff] = useState<ApiUser[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [branches, setBranches] = useState<ApiBranch[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [g, s, u, c, r, b] = await Promise.all([
        groupsApi.list(),
        studentsApi.list(),
        usersApi.list(),
        catalogApi.courses(),
        catalogApi.rooms(),
        catalogApi.branches(),
      ]);
      setApiGroups(g);
      setApiStudents(s);
      setStaff(u);
      setCourses(c);
      setRooms(r);
      setBranches(b);
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
    }
  }, []);

  // Foydalanuvchi kirganda ma'lumotlarni yuklaymiz, chiqqanda tozalaymiz
  const userId = user?.id;
  const firstLoad = useRef(true);
  useEffect(() => {
    if (!userId) {
      setApiGroups([]); setApiStudents([]); setStaff([]); setCourses([]); setRooms([]); setBranches([]);
      firstLoad.current = true;
      return;
    }
    setLoading(true);
    refresh().finally(() => {
      setLoading(false);
      firstLoad.current = false;
    });
  }, [userId, refresh]);

  const groups = useMemo(() => apiGroups.map(toGroup), [apiGroups]);
  const teachers = useMemo(
    () => staff.filter((u) => u.role === "teacher").map((u) => toTeacher(u, groups)),
    [staff, groups],
  );
  const students = useMemo(() => toFlatStudents(apiGroups, apiStudents), [apiGroups, apiStudents]);

  /** Amalni bajaradi, xatoni toast qiladi, ma'lumotlarni yangilaydi */
  const run = useCallback(
    async (action: () => Promise<unknown>, success?: string): Promise<boolean> => {
      try {
        await action();
        await refresh();
        if (success) toast(success, "success");
        return true;
      } catch (e) {
        toast(errorMessage(e), "error");
        return false;
      }
    },
    [refresh, toast],
  );

  const branchId = useCallback(
    (name?: string) => (name ? (branches.find((b) => b.name === name)?.id ?? null) : null),
    [branches],
  );

  const teacherPayload = useCallback(
    (f: Partial<TeacherForm>) => ({
      ...(f.fullName !== undefined && { fullName: f.fullName.trim() }),
      ...(f.phone !== undefined && { phone: phoneDigits(f.phone) }),
      ...(f.telegram !== undefined && { telegram: f.telegram }),
      ...(f.password && { password: f.password }),
      ...(f.percent !== undefined && f.percent !== "" && { percent: Number(f.percent) }),
      ...(f.dob && { dob: f.dob }),
      ...(f.gender && { gender: f.gender }),
      ...(f.branch !== undefined && { branchId: branchId(f.branch) }),
    }),
    [branchId],
  );

  const groupPayload = useCallback(
    (f: Partial<GroupForm>) => {
      const out: Record<string, unknown> = {};
      for (const k of ["name", "badge", "badgeColor", "startDate", "endDate", "days", "lessonStartTime", "price", "status", "tags", "teacherId"] as const) {
        if (f[k] !== undefined) out[k] = f[k];
      }
      if (f.course !== undefined) {
        const c = courses.find((x) => x.name === f.course);
        if (!c) throw new Error(`"${f.course}" nomli kurs topilmadi. Avval Settings → Office → Courses da kurs yarating.`);
        out.courseId = c.id;
      }
      if (f.room !== undefined) out.roomId = rooms.find((r) => r.name === f.room)?.id ?? null;
      if (f.branch !== undefined) out.branchId = branchId(f.branch);
      return out;
    },
    [courses, rooms, branchId],
  );

  const studentPayload = useCallback(
    (f: Partial<StudentForm>) => ({
      ...(f.name !== undefined && { fullName: f.name.trim() }),
      ...(f.phone !== undefined && { phone: phoneDigits(f.phone) }),
      ...(f.dob && { dob: f.dob }),
      ...(f.gender && { gender: f.gender }),
      ...(f.comment !== undefined && { comment: f.comment }),
      ...(f.password && { password: f.password }),
      ...(f.groupId && { groupId: f.groupId }),
      ...(f.active !== undefined && { active: f.active }),
      ...(f.branch !== undefined && { branchId: branchId(f.branch) }),
    }),
    [branchId],
  );

  const value: DataContextValue = {
    loading,
    loadError,
    refresh,
    teachers, groups, students, apiGroups, apiStudents, staff, courses, rooms, branches,

    createTeacher: (f) =>
      run(async () => {
        const created = await usersApi.create({ ...teacherPayload(f), role: "teacher" });
        if (created.temporaryPassword) toast(`Vaqtinchalik parol: ${created.temporaryPassword} (saqlab qo'ying)`, "info");
      }, "O'qituvchi qo'shildi"),
    updateTeacher: (id, f) => run(() => usersApi.update(id, teacherPayload(f)), "O'qituvchi yangilandi"),
    deleteTeacher: (id) => run(() => usersApi.remove(id), "O'qituvchi o'chirildi"),

    createGroup: (f) => run(() => groupsApi.create(groupPayload(f)), "Guruh yaratildi"),
    updateGroup: (id, f) => run(() => groupsApi.update(id, groupPayload(f)), "Guruh yangilandi"),
    deleteGroup: (id) => run(() => groupsApi.remove(id), "Guruh o'chirildi"),
    addStudentToGroup: (groupId, studentId) => run(() => groupsApi.addStudent(groupId, studentId), "O'quvchi guruhga qo'shildi"),
    removeStudentFromGroup: (groupId, studentId) =>
      run(() => groupsApi.removeStudent(groupId, studentId), "O'quvchi guruhdan chiqarildi"),

    createStudent: (f) => run(() => studentsApi.create(studentPayload(f)), "O'quvchi qo'shildi"),
    updateStudent: (id, f) => run(() => studentsApi.update(id, studentPayload(f)), "O'quvchi yangilandi"),
    deleteStudents: (ids) =>
      run(() => (ids.length === 1 ? studentsApi.remove(ids[0]) : studentsApi.bulkDelete(ids)), "O'quvchi o'chirildi"),

    addPayment: (f) => run(() => paymentsApi.create(f), "To'lov qabul qilindi"),
    mutate: run,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
};
