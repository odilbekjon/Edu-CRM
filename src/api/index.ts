import { http } from "./client";
import type {
  ApiBranch, ApiCourse, ApiExpense, ApiGroup, ApiLead, ApiNotification, ApiPayment, ApiReminder,
  ApiRoom, ApiStudent, ApiStudentDetail, ApiUser, ApiWithdrawal, DashboardStats, ScheduleResponse,
} from "./types";

export * from "./client";
export * from "./types";
export * from "./mappers";

export const authApi = {
  login: (phone: string, password: string) =>
    http.post<{ token: string; user: ApiUser }>("/auth/login", { phone, password }),
  me: () => http.get<{ user: ApiUser }>("/auth/me"),
  updateMe: (data: Partial<Pick<ApiUser, "fullName" | "email" | "telegram" | "dob" | "gender">>) =>
    http.patch<{ user: ApiUser }>("/auth/me", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.post<{ ok: true }>("/auth/change-password", { currentPassword, newPassword }),
  submitApplication: (data: { name: string; surname: string; phone: string; email: string; company: string }) =>
    http.post<{ ok: true }>("/public/applications", data),
};

export const usersApi = {
  list: (query?: { role?: string; branchId?: number; q?: string }) => http.get<ApiUser[]>("/users", query),
  create: (data: Record<string, unknown>) => http.post<ApiUser>("/users", data),
  update: (id: number, data: Record<string, unknown>) => http.patch<ApiUser>(`/users/${id}`, data),
  remove: (id: number) => http.delete(`/users/${id}`),
};

export const groupsApi = {
  list: (query?: { branchId?: number; status?: string }) => http.get<ApiGroup[]>("/groups", query),
  create: (data: Record<string, unknown>) => http.post<ApiGroup>("/groups", data),
  update: (id: number, data: Record<string, unknown>) => http.patch<ApiGroup>(`/groups/${id}`, data),
  remove: (id: number) => http.delete(`/groups/${id}`),
  addStudent: (groupId: number, studentId: number) => http.post<ApiGroup>(`/groups/${groupId}/students`, { studentId }),
  removeStudent: (groupId: number, studentId: number) => http.delete<ApiGroup>(`/groups/${groupId}/students/${studentId}`),
};

export const studentsApi = {
  list: (query?: { q?: string; groupId?: number; debtors?: string }) => http.get<ApiStudent[]>("/students", query),
  get: (id: number) => http.get<ApiStudentDetail>(`/students/${id}`),
  create: (data: Record<string, unknown>) => http.post<ApiStudent>("/students", data),
  update: (id: number, data: Record<string, unknown>) => http.patch<ApiStudent>(`/students/${id}`, data),
  remove: (id: number) => http.delete(`/students/${id}`),
  bulkDelete: (ids: number[]) => http.post<{ deleted: number }>("/students/bulk-delete", { ids }),
};

export const paymentsApi = {
  list: (query?: { studentId?: number; from?: string; to?: string; method?: string }) =>
    http.get<ApiPayment[]>("/payments", query),
  create: (data: { studentId: number; amount: number; method?: string; date?: string; comment?: string }) =>
    http.post<ApiPayment>("/payments", data),
  remove: (id: number) => http.delete(`/payments/${id}`),
  withdrawals: (query?: { from?: string; to?: string }) => http.get<ApiWithdrawal[]>("/payments/withdrawals", query),
  createWithdrawal: (data: { studentId: number; amount: number; groupId?: number; date?: string; comment?: string }) =>
    http.post<ApiWithdrawal>("/payments/withdrawals", data),
  removeWithdrawal: (id: number) => http.delete(`/payments/withdrawals/${id}`),
  chargeMonth: (period?: string) => http.post<{ charged: number; skipped: number }>("/payments/charge-month", period ? { period } : {}),
};

export const expensesApi = {
  list: (query?: { from?: string; to?: string; category?: string }) => http.get<ApiExpense[]>("/expenses", query),
  create: (data: Record<string, unknown>) => http.post<ApiExpense>("/expenses", data),
  update: (id: number, data: Record<string, unknown>) => http.patch<ApiExpense>(`/expenses/${id}`, data),
  remove: (id: number) => http.delete(`/expenses/${id}`),
};

export const catalogApi = {
  branches: () => http.get<ApiBranch[]>("/branches"),
  courses: () => http.get<ApiCourse[]>("/courses"),
  createCourse: (data: Record<string, unknown>) => http.post<ApiCourse>("/courses", data),
  updateCourse: (id: number, data: Record<string, unknown>) => http.patch<ApiCourse>(`/courses/${id}`, data),
  removeCourse: (id: number) => http.delete(`/courses/${id}`),
  rooms: () => http.get<ApiRoom[]>("/rooms"),
  createRoom: (data: Record<string, unknown>) => http.post<ApiRoom>("/rooms", data),
  updateRoom: (id: number, data: Record<string, unknown>) => http.patch<ApiRoom>(`/rooms/${id}`, data),
  removeRoom: (id: number) => http.delete(`/rooms/${id}`),
};

export const leadsApi = {
  list: (query?: { status?: string; q?: string }) => http.get<ApiLead[]>("/leads", query),
  create: (data: Record<string, unknown>) => http.post<ApiLead>("/leads", data),
  update: (id: number, data: Record<string, unknown>) => http.patch<ApiLead>(`/leads/${id}`, data),
  remove: (id: number) => http.delete(`/leads/${id}`),
  convert: (id: number, groupId?: number) => http.post(`/leads/${id}/convert`, groupId ? { groupId } : {}),
};

export const remindersApi = {
  list: (query?: { done?: string }) => http.get<ApiReminder[]>("/reminders", query),
  create: (data: Record<string, unknown>) => http.post<ApiReminder>("/reminders", data),
  update: (id: number, data: Record<string, unknown>) => http.patch<ApiReminder>(`/reminders/${id}`, data),
  remove: (id: number) => http.delete(`/reminders/${id}`),
};

export const notificationsApi = {
  list: () => http.get<ApiNotification[]>("/notifications"),
  readAll: () => http.post<{ ok: true }>("/notifications/read-all"),
};

export const dashboardApi = {
  stats: () => http.get<DashboardStats>("/dashboard/stats"),
  revenue: () => http.get<Array<{ month: string; value: number }>>("/dashboard/revenue"),
  schedule: () => http.get<ScheduleResponse>("/dashboard/schedule"),
};

export const attendanceApi = {
  month: (groupId: number, month: string) =>
    http.get<Array<{ studentId: number; date: string; status: string }>>("/attendance", { groupId, month }),
  mark: (data: { groupId: number; date: string; records: Array<{ studentId: number; status: string }> }) =>
    http.put<{ saved: number }>("/attendance", data),
  unmark: (groupId: number, studentId: number, date: string) =>
    http.delete(`/attendance?groupId=${groupId}&studentId=${studentId}&date=${date}`),
  report: (date: string) =>
    http.get<Array<{ groupId: number; studentId: number; status: string }>>("/attendance/report", { date }),
};

export const gradesApi = {
  group: (groupId: number) => http.get<Array<{ studentId: number; value: number }>>("/grades", { groupId }),
  set: (data: { groupId: number; studentId: number; value: number; date?: string }) => http.put("/grades", data),
  rating: (query?: { from?: string; to?: string }) =>
    http.get<Array<{ studentId: number; name: string; group: string; grade: number }>>("/grades/rating", query),
};
