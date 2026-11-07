// Backend javoblari (CRM-backend/src/lib/serializers.ts bilan mos)

export type Role = "ceo" | "admin" | "manager" | "accountant" | "teacher";

export interface ApiBranch {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
}

export interface ApiUser {
  id: number;
  uid: string;
  fullName: string;
  phone: string;
  email: string | null;
  telegram: string | null;
  role: Role;
  dob: string | null;
  gender: string | null;
  percent: number | null;
  active: boolean;
  branchId: number | null;
  branch: { id: number; name: string } | null;
  temporaryPassword?: string;
}

export interface ApiGroupStudent {
  id: number;
  fullName: string;
  phone: string;
  balance: number;
  active: boolean;
  enrolled: boolean;
  joinedAt: string;
}

export interface ApiGroup {
  id: number;
  name: string;
  badge: string;
  badgeColor: "blue" | "green" | "amber";
  startDate: string;
  endDate: string;
  days: string;
  lessonStartTime: string;
  price: number;
  status: "Active" | "Archive" | "Completed";
  tags: string[];
  courseId: number;
  course: { id: number; name: string; color: string };
  teacherId: number;
  teacher: { id: number; fullName: string };
  roomId: number | null;
  room: { id: number; name: string; capacity: number } | null;
  branchId: number | null;
  branch: { id: number; name: string } | null;
  studentCount: number;
  students: ApiGroupStudent[];
}

export interface ApiStudent {
  id: number;
  fullName: string;
  phone: string;
  phone2: string | null;
  dob: string | null;
  gender: string | null;
  comment: string | null;
  balance: number;
  active: boolean;
  branchId: number | null;
  branch: { id: number; name: string } | null;
  createdAt: string;
  groups: Array<{
    groupId: number;
    name: string;
    badge: string;
    badgeColor: "blue" | "green" | "amber";
    days: string;
    lessonStartTime: string;
    startDate: string;
    endDate: string;
    price: number;
    course: { id: number; name: string; color: string };
    teacher: { id: number; fullName: string };
    room: { id: number; name: string; capacity: number } | null;
    branch: { id: number; name: string } | null;
    joinedAt: string;
  }>;
}

export interface ApiStudentDetail extends ApiStudent {
  payments: Array<{ id: number; amount: number; method: string; date: string; comment: string | null }>;
}

export interface ApiCourse {
  id: number;
  name: string;
  code: string | null;
  price: number;
  color: string;
  lessonDuration: string;
  courseDuration: number;
  description: string;
  students: number;
  groups: Array<{
    id: number;
    name: string;
    days: string;
    lessonStartTime: string;
    startDate: string;
    endDate: string;
    teacher: { id: number; fullName: string };
    students: number;
  }>;
}

export interface ApiRoom {
  id: number;
  name: string;
  capacity: number;
  branchId: number | null;
  branch?: { id: number; name: string } | null;
}

export interface ApiPayment {
  id: number;
  studentId: number;
  amount: number;
  method: string;
  date: string;
  comment: string | null;
  student: { id: number; fullName: string; phone: string; balance?: number };
  createdBy?: { id: number; fullName: string } | null;
}

export interface ApiExpense {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  comment: string | null;
  payee: string | null;
  method: string;
  kind: "expense" | "refund";
}

export interface ApiLead {
  id: number;
  name: string;
  phone: string;
  source: string | null;
  status: "new" | "contacted" | "trial" | "converted" | "lost";
  comment: string | null;
  course: { id: number; name: string } | null;
  createdAt: string;
}

export interface ApiReminder {
  id: number;
  title: string;
  note: string | null;
  dueAt: string;
  done: boolean;
  tags: string | null;
  assignee: { id: number; fullName: string } | null;
  student: { id: number; fullName: string } | null;
  group: { id: number; name: string } | null;
}

export interface ApiNotification {
  id: number;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  leads: number;
  students: number;
  groups: number;
  debtors: number;
  trial: number;
  paid: number;
  leftActive: number;
  leftTrial: number;
}

export interface ScheduleResponse {
  rooms: string[];
  events: Array<{
    id: string;
    room: string;
    start: number;
    duration: number;
    groupName: string;
    courseName: string;
    teacher: string;
    dateRange: string;
    students: number;
    maxStudents: number;
    color: string;
    tag?: string;
    tagColor?: string;
    days: Array<"odd" | "even" | "other">;
  }>;
}

export interface ApiWithdrawal {
  id: number;
  studentId: number;
  amount: number;
  date: string;
  period: string | null;
  comment: string | null;
  student: { id: number; fullName: string; phone: string };
  group: { id: number; name: string; course: { name: string } } | null;
  createdBy: { id: number; fullName: string } | null;
}
