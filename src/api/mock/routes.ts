// Backend o'rnini bosuvchi demo yo'naltirgich: API so'rovlarini brauzer ichidagi ma'lumotlar bilan bajaradi.
// Javob shakllari kelajakdagi haqiqiy backend bilan bir xil.

import { ApiError } from "../errors";
import {
  getDb, nextId, save, todayISO,
  type GroupRow, type StudentRow, type UserRow,
} from "./store";

type Query = Record<string, string | undefined>;
interface Ctx {
  params: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  query: Query;
  user: UserRow | null;
}
type Handler = (c: Ctx) => unknown;

const fail = (status: number, message: string): never => {
  throw new ApiError(status, message);
};

const MANAGE = ["ceo", "admin", "manager"];
const FINANCE = ["ceo", "admin", "manager", "accountant"];

const normPhone = (raw: string) => {
  const d = String(raw ?? "").replace(/\D/g, "");
  return d.length > 9 && d.startsWith("998") ? d.slice(3) : d;
};
const req = <T>(v: T | undefined | null | "", msg: string): T => (v === undefined || v === null || v === "" ? fail(400, msg) : (v as T));

const need = (c: Ctx, roles: string[]) => {
  if (!c.user) fail(401, "Avtorizatsiya talab qilinadi");
  if (!roles.includes(c.user!.role)) fail(403, "Bu amal uchun ruxsat yo'q");
};

/* ───────── Serializatorlar ───────── */

const nameOf = <T extends { id: number; name: string }>(list: T[], id: number | null) => {
  const x = id == null ? undefined : list.find((i) => i.id === id);
  return x ? { id: x.id, name: x.name } : null;
};

function serializeUser(u: UserRow) {
  const db = getDb();
  return {
    id: u.id, uid: u.uid, fullName: u.fullName, phone: u.phone, email: u.email, telegram: u.telegram,
    role: u.role, dob: u.dob, gender: u.gender, percent: u.percent, active: u.active, branchId: u.branchId,
    branch: nameOf(db.branches, u.branchId),
  };
}

function serializeGroup(g: GroupRow) {
  const db = getDb();
  const course = db.courses.find((c) => c.id === g.courseId)!;
  const teacher = db.users.find((u) => u.id === g.teacherId)!;
  const room = db.rooms.find((r) => r.id === g.roomId);
  const students = db.enrollments
    .filter((e) => e.groupId === g.id)
    .map((e) => {
      const s = db.students.find((x) => x.id === e.studentId)!;
      return {
        id: s.id, fullName: s.fullName, phone: s.phone, balance: s.balance, active: e.active && s.active,
        enrolled: e.active, joinedAt: e.joinedAt,
      };
    });
  return {
    id: g.id, name: g.name, badge: g.badge, badgeColor: g.badgeColor, startDate: g.startDate, endDate: g.endDate,
    days: g.days, lessonStartTime: g.lessonStartTime, price: g.price, status: g.status, tags: g.tags,
    courseId: g.courseId, course: { id: course.id, name: course.name, color: course.color },
    teacherId: g.teacherId, teacher: { id: teacher.id, fullName: teacher.fullName },
    roomId: g.roomId, room: room ? { id: room.id, name: room.name, capacity: room.capacity } : null,
    branchId: g.branchId, branch: nameOf(db.branches, g.branchId),
    studentCount: students.filter((s) => s.enrolled).length, students,
  };
}

function serializeStudent(s: StudentRow) {
  const db = getDb();
  const groups = db.enrollments
    .filter((e) => e.studentId === s.id && e.active)
    .map((e) => {
      const g = db.groups.find((x) => x.id === e.groupId)!;
      const sg = serializeGroup(g);
      return {
        groupId: g.id, name: g.name, badge: g.badge, badgeColor: g.badgeColor, days: g.days,
        lessonStartTime: g.lessonStartTime, startDate: g.startDate, endDate: g.endDate, price: g.price,
        course: sg.course, teacher: sg.teacher, room: sg.room, branch: sg.branch, joinedAt: e.joinedAt,
      };
    });
  return {
    id: s.id, fullName: s.fullName, phone: s.phone, phone2: s.phone2, dob: s.dob, gender: s.gender,
    comment: s.comment, balance: s.balance, active: s.active, branchId: s.branchId,
    branch: nameOf(db.branches, s.branchId), createdAt: s.createdAt, groups,
  };
}

const personRef = (id: number | null) => {
  const u = id == null ? undefined : getDb().users.find((x) => x.id === id);
  return u ? { id: u.id, fullName: u.fullName } : null;
};

/* ───────── Yordamchilar ───────── */

const visibleGroups = (c: Ctx) => {
  const db = getDb();
  return c.user!.role === "teacher" ? db.groups.filter((g) => g.teacherId === c.user!.id) : db.groups;
};

const inRange = (date: string, from?: string, to?: string) => (!from || date >= from) && (!to || date <= to);

const monthKey = (d: Date) => d.toISOString().slice(0, 7);

function newUid() {
  const db = getDb();
  for (;;) {
    const uid = String(1_000_000 + Math.floor(Math.random() * 8_999_999));
    if (!db.users.some((u) => u.uid === uid)) return uid;
  }
}

/* ───────── Yo'llar ───────── */

const routes: Array<[string, string, Handler]> = [];
const on = (method: string, pattern: string, h: Handler) => routes.push([method, pattern, h]);

/* — Auth — */
on("POST", "/auth/login", (c) => {
  const phone = normPhone(req(c.body.phone, "Telefon raqam kiritilmagan"));
  const pass = req(c.body.password, "Parol kiritilmagan");
  const u = getDb().users.find((x) => x.phone === phone);
  if (!u || !u.active || u.password !== pass) fail(401, "Telefon raqam yoki parol noto'g'ri");
  return { token: `mock.${u!.id}`, user: serializeUser(u!) };
});
on("GET", "/auth/me", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  return { user: serializeUser(c.user!) };
});
on("PATCH", "/auth/me", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  const u = c.user!;
  const b = c.body;
  if (b.fullName !== undefined) u.fullName = b.fullName;
  if (b.email !== undefined) u.email = b.email || null;
  if (b.telegram !== undefined) u.telegram = b.telegram || null;
  if (b.dob !== undefined) u.dob = b.dob || null;
  if (b.gender !== undefined) u.gender = b.gender || null;
  save();
  return { user: serializeUser(u) };
});
on("POST", "/auth/change-password", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  if (c.user!.password !== c.body.currentPassword) fail(400, "Joriy parol noto'g'ri");
  if (String(c.body.newPassword ?? "").length < 4) fail(400, "Yangi parol kamida 4 belgidan iborat bo'lishi kerak");
  c.user!.password = c.body.newPassword;
  save();
  return { ok: true };
});
on("POST", "/public/applications", (c) => {
  const db = getDb();
  const b = c.body;
  db.leads.push({
    id: nextId("leads"), name: `${b.name ?? ""} ${b.surname ?? ""}`.trim(), phone: normPhone(b.phone),
    source: "Website application", status: "new", comment: [b.company && `Kompaniya: ${b.company}`, b.email && `Email: ${b.email}`].filter(Boolean).join("; ") || null,
    courseId: null, branchId: null, createdAt: new Date().toISOString(),
  });
  save();
  return { ok: true };
});

/* — Foydalanuvchilar — */
on("GET", "/users", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  const { role, q } = c.query;
  const t = (q ?? "").toLowerCase();
  return getDb().users
    .filter((u) => (!role || u.role === role) && (!t || u.fullName.toLowerCase().includes(t) || u.phone.includes(t)))
    .map(serializeUser);
});
on("POST", "/users", (c) => {
  need(c, MANAGE);
  const db = getDb();
  const b = c.body;
  const phone = normPhone(b.phone);
  if (phone.length !== 9) fail(400, "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak");
  if (String(b.fullName ?? "").trim().length < 2) fail(400, "Ism kamida 2 belgi");
  if (db.users.some((u) => u.phone === phone)) fail(409, "Bunday telefon raqamli xodim allaqachon mavjud");
  const role = b.role ?? "teacher";
  if (["ceo", "admin"].includes(role) && c.user!.role !== "ceo") fail(403, "CEO/admin rolini faqat CEO yarata oladi");
  const tempPassword = b.password || String(10_000_000 + Math.floor(Math.random() * 89_999_999));
  const u: UserRow = {
    id: nextId("users"), uid: newUid(), fullName: b.fullName.trim(), phone, password: tempPassword,
    email: b.email || null, telegram: b.telegram ?? null, role, dob: b.dob ?? null, gender: b.gender ?? null,
    percent: b.percent ?? null, active: true, branchId: b.branchId ?? null,
  };
  db.users.push(u);
  save();
  return { ...serializeUser(u), ...(b.password ? {} : { temporaryPassword: tempPassword }) };
});
on("PATCH", "/users/:id", (c) => {
  need(c, MANAGE);
  const db = getDb();
  const u = db.users.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Foydalanuvchi topilmadi");
  const b = c.body;
  if (b.phone !== undefined) {
    const p = normPhone(b.phone);
    if (p.length !== 9) fail(400, "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak");
    if (db.users.some((x) => x.phone === p && x.id !== u.id)) fail(409, "Bunday telefon raqam allaqachon mavjud");
    u.phone = p;
  }
  for (const k of ["fullName", "telegram", "dob", "gender", "percent", "active", "role", "branchId"] as const) {
    if (b[k] !== undefined) (u as unknown as Record<string, unknown>)[k] = b[k];
  }
  if (b.email !== undefined) u.email = b.email || null;
  if (b.password) u.password = b.password;
  save();
  return serializeUser(u);
});
on("DELETE", "/users/:id", (c) => {
  need(c, ["ceo", "admin"]);
  const db = getDb();
  const id = Number(c.params.id);
  if (id === c.user!.id) fail(400, "O'zingizni o'chira olmaysiz");
  if (db.groups.some((g) => g.teacherId === id)) fail(409, "Bu o'qituvchining guruhlari bor. Avval guruhlarni boshqa o'qituvchiga o'tkazing.");
  db.users = db.users.filter((u) => u.id !== id);
  save();
});

/* — Filial / kurs / xona — */
on("GET", "/branches", () => getDb().branches);

on("GET", "/courses", () => {
  const db = getDb();
  return db.courses.map((co) => {
    const groups = db.groups.filter((g) => g.courseId === co.id).map((g) => {
      const t = db.users.find((u) => u.id === g.teacherId)!;
      return {
        id: g.id, name: g.name, days: g.days, lessonStartTime: g.lessonStartTime, startDate: g.startDate, endDate: g.endDate,
        teacher: { id: t.id, fullName: t.fullName },
        students: db.enrollments.filter((e) => e.groupId === g.id && e.active).length,
      };
    });
    return { ...co, students: groups.reduce((s, g) => s + g.students, 0), groups };
  });
});
on("POST", "/courses", (c) => {
  need(c, MANAGE);
  const db = getDb();
  const b = c.body;
  if (!String(b.name ?? "").trim()) fail(400, "Kurs nomi kerak");
  if (db.courses.some((x) => x.name === b.name.trim())) fail(409, "Bunday nomli kurs allaqachon mavjud");
  const co = {
    id: nextId("courses"), name: b.name.trim(), code: b.code ?? null, price: b.price ?? 0, color: b.color ?? "#4f7cff",
    lessonDuration: b.lessonDuration ?? "90 minutes", courseDuration: b.courseDuration ?? 6, description: b.description ?? "",
  };
  db.courses.push(co);
  save();
  return co;
});
on("PATCH", "/courses/:id", (c) => {
  need(c, MANAGE);
  const co = getDb().courses.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Kurs topilmadi");
  Object.assign(co, c.body);
  save();
  return co;
});
on("DELETE", "/courses/:id", (c) => {
  need(c, ["ceo", "admin"]);
  const db = getDb();
  const id = Number(c.params.id);
  if (db.groups.some((g) => g.courseId === id)) fail(409, "Bu kursga guruhlar bog'langan. Avval guruhlarni o'chiring.");
  db.courses = db.courses.filter((x) => x.id !== id);
  save();
});

on("GET", "/rooms", (c) => {
  const db = getDb();
  const bid = c.query.branchId ? Number(c.query.branchId) : undefined;
  return db.rooms.filter((r) => !bid || r.branchId === bid).map((r) => ({ ...r, branch: nameOf(db.branches, r.branchId) }));
});
on("POST", "/rooms", (c) => {
  need(c, MANAGE);
  const db = getDb();
  if (!String(c.body.name ?? "").trim()) fail(400, "Xona nomi kerak");
  const r = { id: nextId("rooms"), name: c.body.name.trim(), capacity: c.body.capacity ?? 20, branchId: c.body.branchId ?? null };
  db.rooms.push(r);
  save();
  return r;
});
on("PATCH", "/rooms/:id", (c) => {
  need(c, MANAGE);
  const r = getDb().rooms.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Xona topilmadi");
  Object.assign(r, c.body);
  save();
  return r;
});
on("DELETE", "/rooms/:id", (c) => {
  need(c, ["ceo", "admin"]);
  const db = getDb();
  const id = Number(c.params.id);
  db.groups.forEach((g) => { if (g.roomId === id) g.roomId = null; });
  db.rooms = db.rooms.filter((r) => r.id !== id);
  save();
});

/* — Guruhlar — */
on("GET", "/groups", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  const { status, branchId, teacherId } = c.query;
  return visibleGroups(c)
    .filter((g) => (!status || g.status === status) && (!branchId || g.branchId === Number(branchId)) && (!teacherId || g.teacherId === Number(teacherId)))
    .map(serializeGroup);
});
on("GET", "/groups/:id", (c) => {
  const g = visibleGroups(c).find((x) => x.id === Number(c.params.id)) ?? fail(404, "Guruh topilmadi");
  return serializeGroup(g);
});
on("POST", "/groups", (c) => {
  need(c, MANAGE);
  const db = getDb();
  const b = c.body;
  if (!String(b.name ?? "").trim()) fail(400, "Guruh nomi kerak");
  if (!db.courses.some((x) => x.id === b.courseId)) fail(400, "Kurs tanlanmagan");
  if (!db.users.some((x) => x.id === b.teacherId)) fail(400, "O'qituvchi tanlanmagan");
  if (!b.startDate || !b.endDate) fail(400, "Boshlanish va tugash sanasi kerak");
  const g: GroupRow = {
    id: nextId("groups"), name: b.name.trim(), badge: b.badge ?? "", badgeColor: b.badgeColor ?? "blue",
    startDate: b.startDate, endDate: b.endDate, days: b.days ?? "Odd days", lessonStartTime: b.lessonStartTime ?? "09:00",
    price: b.price ?? 0, status: b.status ?? "Active", tags: b.tags ?? [], courseId: b.courseId, teacherId: b.teacherId,
    roomId: b.roomId ?? null, branchId: b.branchId ?? null,
  };
  db.groups.push(g);
  save();
  return serializeGroup(g);
});
on("PATCH", "/groups/:id", (c) => {
  need(c, MANAGE);
  const g = getDb().groups.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Guruh topilmadi");
  Object.assign(g, c.body);
  save();
  return serializeGroup(g);
});
on("DELETE", "/groups/:id", (c) => {
  need(c, ["ceo", "admin"]);
  const db = getDb();
  const id = Number(c.params.id);
  db.groups = db.groups.filter((g) => g.id !== id);
  db.enrollments = db.enrollments.filter((e) => e.groupId !== id);
  db.attendance = db.attendance.filter((a) => a.groupId !== id);
  db.grades = db.grades.filter((a) => a.groupId !== id);
  save();
});
on("POST", "/groups/:id/students", (c) => {
  need(c, MANAGE);
  const db = getDb();
  const g = db.groups.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Guruh topilmadi");
  const sid = Number(c.body.studentId);
  if (!db.students.some((s) => s.id === sid)) fail(404, "O'quvchi topilmadi");
  const room = db.rooms.find((r) => r.id === g.roomId);
  const existing = db.enrollments.find((e) => e.groupId === g.id && e.studentId === sid);
  if (room && !existing?.active && db.enrollments.filter((e) => e.groupId === g.id && e.active).length >= room.capacity) {
    fail(409, "Xona sig'imi to'lgan");
  }
  if (existing) {
    existing.active = true;
    existing.leftAt = null;
  } else {
    db.enrollments.push({ id: nextId("enrollments"), studentId: sid, groupId: g.id, active: true, joinedAt: new Date().toISOString(), leftAt: null });
  }
  save();
  return serializeGroup(g);
});
on("DELETE", "/groups/:id/students/:sid", (c) => {
  need(c, MANAGE);
  const db = getDb();
  const g = db.groups.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Guruh topilmadi");
  const e = db.enrollments.find((x) => x.groupId === g.id && x.studentId === Number(c.params.sid)) ?? fail(404, "Yozuv topilmadi");
  e.active = false;
  e.leftAt = new Date().toISOString();
  save();
  return serializeGroup(g);
});

/* — O'quvchilar — */
on("GET", "/students", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  const db = getDb();
  const q = (c.query.q ?? "").toLowerCase();
  const gid = c.query.groupId ? Number(c.query.groupId) : undefined;
  const myGroups = new Set(visibleGroups(c).map((g) => g.id));
  return db.students
    .filter((s) => {
      if (q && !s.fullName.toLowerCase().includes(q) && !s.phone.includes(q)) return false;
      if (c.query.debtors === "1" && s.balance >= 0) return false;
      if (gid && !db.enrollments.some((e) => e.studentId === s.id && e.groupId === gid && e.active)) return false;
      if (c.user!.role === "teacher" && !db.enrollments.some((e) => e.studentId === s.id && e.active && myGroups.has(e.groupId))) return false;
      return true;
    })
    .sort((a, b) => b.id - a.id)
    .map(serializeStudent);
});
on("GET", "/students/:id", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  const db = getDb();
  const s = db.students.find((x) => x.id === Number(c.params.id)) ?? fail(404, "O'quvchi topilmadi");
  const payments = db.payments.filter((p) => p.studentId === s.id).sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => ({ id: p.id, amount: p.amount, method: p.method, date: p.date, comment: p.comment }));
  return { ...serializeStudent(s), payments };
});
on("POST", "/students", (c) => {
  need(c, MANAGE);
  const db = getDb();
  const b = c.body;
  const phone = normPhone(b.phone);
  if (String(b.fullName ?? "").trim().length < 2) fail(400, "Ism kamida 2 belgi");
  if (phone.length !== 9) fail(400, "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak");
  if (b.groupId && !db.groups.some((g) => g.id === b.groupId)) fail(404, "Guruh topilmadi");
  const s: StudentRow = {
    id: nextId("students"), fullName: b.fullName.trim(), phone, phone2: b.phone2 ?? null, dob: b.dob ?? null, gender: b.gender ?? null,
    comment: b.comment ?? null, balance: 0, active: b.active ?? true, branchId: b.branchId ?? c.user!.branchId, createdAt: new Date().toISOString(),
  };
  db.students.push(s);
  if (b.groupId) db.enrollments.push({ id: nextId("enrollments"), studentId: s.id, groupId: b.groupId, active: true, joinedAt: new Date().toISOString(), leftAt: null });
  save();
  return serializeStudent(s);
});
on("PATCH", "/students/:id", (c) => {
  need(c, MANAGE);
  const s = getDb().students.find((x) => x.id === Number(c.params.id)) ?? fail(404, "O'quvchi topilmadi");
  const b = c.body;
  if (b.phone !== undefined) {
    const p = normPhone(b.phone);
    if (p.length !== 9) fail(400, "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak");
    s.phone = p;
  }
  for (const k of ["fullName", "phone2", "dob", "gender", "comment", "active", "branchId"] as const) {
    if (b[k] !== undefined) (s as unknown as Record<string, unknown>)[k] = b[k];
  }
  save();
  return serializeStudent(s);
});
const removeStudents = (ids: number[]) => {
  const db = getDb();
  const set = new Set(ids);
  db.students = db.students.filter((s) => !set.has(s.id));
  db.enrollments = db.enrollments.filter((e) => !set.has(e.studentId));
  db.payments = db.payments.filter((p) => !set.has(p.studentId));
  db.charges = db.charges.filter((p) => !set.has(p.studentId));
  db.attendance = db.attendance.filter((a) => !set.has(a.studentId));
  db.grades = db.grades.filter((a) => !set.has(a.studentId));
  save();
};
on("DELETE", "/students/:id", (c) => {
  need(c, MANAGE);
  removeStudents([Number(c.params.id)]);
});
on("POST", "/students/bulk-delete", (c) => {
  need(c, MANAGE);
  const ids: number[] = c.body.ids ?? [];
  removeStudents(ids);
  return { deleted: ids.length };
});

/* — To'lovlar — */
on("GET", "/payments", (c) => {
  need(c, FINANCE);
  const db = getDb();
  const { studentId, from, to, method } = c.query;
  return db.payments
    .filter((p) => (!studentId || p.studentId === Number(studentId)) && (!method || p.method === method) && inRange(p.date, from, to))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .map((p) => {
      const s = db.students.find((x) => x.id === p.studentId)!;
      return { ...p, student: { id: s.id, fullName: s.fullName, phone: s.phone }, createdBy: personRef(p.createdById) };
    });
});
on("POST", "/payments", (c) => {
  need(c, FINANCE);
  const db = getDb();
  const b = c.body;
  const s = db.students.find((x) => x.id === b.studentId) ?? fail(404, "O'quvchi topilmadi");
  if (!(Number(b.amount) > 0)) fail(400, "Summa 0 dan katta bo'lishi kerak");
  s.balance += Number(b.amount);
  const p = {
    id: nextId("payments"), studentId: s.id, amount: Number(b.amount), method: b.method ?? "Cash", date: b.date ?? todayISO(),
    comment: b.comment ?? null, createdById: c.user!.id, branchId: s.branchId,
  };
  db.payments.push(p);
  save();
  return { ...p, student: { id: s.id, fullName: s.fullName, phone: s.phone, balance: s.balance } };
});
on("DELETE", "/payments/:id", (c) => {
  need(c, ["ceo", "admin"]);
  const db = getDb();
  const p = db.payments.find((x) => x.id === Number(c.params.id)) ?? fail(404, "To'lov topilmadi");
  const s = db.students.find((x) => x.id === p.studentId);
  if (s) s.balance -= p.amount;
  db.payments = db.payments.filter((x) => x.id !== p.id);
  save();
});
on("GET", "/payments/withdrawals", (c) => {
  need(c, FINANCE);
  const db = getDb();
  return db.charges
    .filter((x) => inRange(x.date, c.query.from, c.query.to))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .map((x) => {
      const s = db.students.find((y) => y.id === x.studentId)!;
      const g = db.groups.find((y) => y.id === x.groupId);
      const co = g ? db.courses.find((y) => y.id === g.courseId) : undefined;
      return {
        ...x, student: { id: s.id, fullName: s.fullName, phone: s.phone },
        group: g ? { id: g.id, name: g.name, course: { name: co?.name ?? "" } } : null, createdBy: personRef(x.createdById),
      };
    });
});
on("POST", "/payments/withdrawals", (c) => {
  need(c, MANAGE);
  const db = getDb();
  const b = c.body;
  const s = db.students.find((x) => x.id === b.studentId) ?? fail(404, "O'quvchi topilmadi");
  if (!(Number(b.amount) > 0)) fail(400, "Summa 0 dan katta bo'lishi kerak");
  s.balance -= Number(b.amount);
  const ch = {
    id: nextId("charges"), studentId: s.id, groupId: b.groupId ?? null, amount: Number(b.amount), date: b.date ?? todayISO(),
    period: null, comment: b.comment ?? null, createdById: c.user!.id,
  };
  db.charges.push(ch);
  save();
  return ch;
});
on("DELETE", "/payments/withdrawals/:id", (c) => {
  need(c, ["ceo", "admin"]);
  const db = getDb();
  const ch = db.charges.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Yozuv topilmadi");
  const s = db.students.find((x) => x.id === ch.studentId);
  if (s) s.balance += ch.amount;
  db.charges = db.charges.filter((x) => x.id !== ch.id);
  save();
});
on("POST", "/payments/charge-month", (c) => {
  need(c, ["ceo", "admin"]);
  const db = getDb();
  const period = c.body.period ?? todayISO().slice(0, 7);
  const done = new Set(db.charges.filter((x) => x.period === period).map((x) => `${x.studentId}:${x.groupId}`));
  const enrollments = db.enrollments.filter((e) => {
    const g = db.groups.find((x) => x.id === e.groupId);
    const s = db.students.find((x) => x.id === e.studentId);
    return e.active && g?.status === "Active" && s?.active;
  });
  let charged = 0;
  for (const e of enrollments) {
    const g = db.groups.find((x) => x.id === e.groupId)!;
    if (g.price <= 0 || done.has(`${e.studentId}:${e.groupId}`)) continue;
    db.students.find((x) => x.id === e.studentId)!.balance -= g.price;
    db.charges.push({
      id: nextId("charges"), studentId: e.studentId, groupId: g.id, amount: g.price, date: todayISO(), period,
      comment: `${g.name} — ${period}`, createdById: c.user!.id,
    });
    charged++;
  }
  save();
  return { charged, skipped: enrollments.length - charged };
});

/* — Xarajatlar — */
on("GET", "/expenses", (c) => {
  need(c, FINANCE);
  return getDb().expenses
    .filter((e) => (!c.query.category || e.category === c.query.category) && inRange(e.date, c.query.from, c.query.to))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
});
on("POST", "/expenses", (c) => {
  need(c, FINANCE);
  const b = c.body;
  if (!String(b.title ?? "").trim()) fail(400, "Nomi kerak");
  if (!(Number(b.amount) > 0)) fail(400, "Summa 0 dan katta bo'lishi kerak");
  const e = {
    id: nextId("expenses"), title: b.title, category: b.category ?? "Other", amount: Number(b.amount), date: b.date ?? todayISO(),
    comment: b.comment ?? null, payee: b.payee ?? null, method: b.method ?? "Cash", kind: (b.kind ?? "expense") as "expense" | "refund",
    branchId: b.branchId ?? c.user!.branchId,
  };
  getDb().expenses.push(e);
  save();
  return e;
});
on("PATCH", "/expenses/:id", (c) => {
  need(c, FINANCE);
  const e = getDb().expenses.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Yozuv topilmadi");
  Object.assign(e, c.body);
  save();
  return e;
});
on("DELETE", "/expenses/:id", (c) => {
  need(c, ["ceo", "admin"]);
  const db = getDb();
  db.expenses = db.expenses.filter((x) => x.id !== Number(c.params.id));
  save();
});

/* — Lead'lar — */
const leadOut = (l: ReturnType<typeof getDb>["leads"][number]) => {
  const db = getDb();
  const co = db.courses.find((x) => x.id === l.courseId);
  return { ...l, course: co ? { id: co.id, name: co.name } : null, branch: nameOf(db.branches, l.branchId) };
};
on("GET", "/leads", (c) => {
  need(c, MANAGE);
  const q = (c.query.q ?? "").toLowerCase();
  return getDb().leads
    .filter((l) => (!c.query.status || l.status === c.query.status) && (!q || l.name.toLowerCase().includes(q) || l.phone.includes(q)))
    .sort((a, b) => b.id - a.id)
    .map(leadOut);
});
on("POST", "/leads", (c) => {
  need(c, MANAGE);
  const b = c.body;
  if (String(b.name ?? "").trim().length < 2) fail(400, "Ism kamida 2 belgi");
  const l = {
    id: nextId("leads"), name: b.name.trim(), phone: normPhone(b.phone) || "—", source: b.source ?? null, status: b.status ?? "new",
    comment: b.comment ?? null, courseId: b.courseId ?? null, branchId: b.branchId ?? c.user!.branchId, createdAt: new Date().toISOString(),
  };
  getDb().leads.push(l);
  save();
  return leadOut(l);
});
on("PATCH", "/leads/:id", (c) => {
  need(c, MANAGE);
  const l = getDb().leads.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Lead topilmadi");
  Object.assign(l, c.body);
  save();
  return leadOut(l);
});
on("DELETE", "/leads/:id", (c) => {
  need(c, MANAGE);
  const db = getDb();
  db.leads = db.leads.filter((x) => x.id !== Number(c.params.id));
  save();
});
on("POST", "/leads/:id/convert", (c) => {
  need(c, MANAGE);
  const db = getDb();
  const l = db.leads.find((x) => x.id === Number(c.params.id)) ?? fail(404, "Lead topilmadi");
  l.status = "converted";
  const s: StudentRow = {
    id: nextId("students"), fullName: l.name, phone: l.phone, phone2: null, dob: null, gender: null, comment: l.comment,
    balance: 0, active: true, branchId: l.branchId, createdAt: new Date().toISOString(),
  };
  db.students.push(s);
  if (c.body.groupId) db.enrollments.push({ id: nextId("enrollments"), studentId: s.id, groupId: c.body.groupId, active: true, joinedAt: new Date().toISOString(), leftAt: null });
  save();
  return s;
});

/* — Eslatmalar / bildirishnomalar — */
const isMgr = (u: UserRow) => MANAGE.includes(u.role);
const reminderOut = (r: ReturnType<typeof getDb>["reminders"][number]) => {
  const db = getDb();
  const s = db.students.find((x) => x.id === r.studentId);
  const g = db.groups.find((x) => x.id === r.groupId);
  return {
    ...r, student: s ? { id: s.id, fullName: s.fullName } : null, group: g ? { id: g.id, name: g.name } : null, assignee: personRef(r.assigneeId),
  };
};
const canTouch = (u: UserRow, r: { userId: number | null; assigneeId: number | null }) => isMgr(u) || r.userId === u.id || r.assigneeId === u.id;

on("GET", "/reminders", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  const done = c.query.done === undefined ? undefined : c.query.done === "1";
  return getDb().reminders
    .filter((r) => canTouch(c.user!, r) && (done === undefined || r.done === done))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .map(reminderOut);
});
on("POST", "/reminders", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  const b = c.body;
  if (!String(b.title ?? "").trim()) fail(400, "Sarlavha kerak");
  const r = {
    id: nextId("reminders"), title: b.title, note: b.note ?? null, dueAt: req(b.dueAt, "Muddat kerak"), done: false, tags: b.tags ?? null,
    userId: c.user!.id, assigneeId: b.assigneeId ?? null, studentId: b.studentId ?? null, groupId: b.groupId ?? null,
  };
  getDb().reminders.push(r);
  save();
  return reminderOut(r);
});
on("PATCH", "/reminders/:id", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  const r = getDb().reminders.find((x) => x.id === Number(c.params.id));
  if (!r || !canTouch(c.user!, r)) fail(404, "Eslatma topilmadi");
  Object.assign(r!, c.body);
  save();
  return reminderOut(r!);
});
on("DELETE", "/reminders/:id", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  const db = getDb();
  const r = db.reminders.find((x) => x.id === Number(c.params.id));
  if (!r || !canTouch(c.user!, r)) fail(404, "Eslatma topilmadi");
  db.reminders = db.reminders.filter((x) => x.id !== r!.id);
  save();
});
on("GET", "/notifications", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  return getDb().notifications
    .filter((n) => n.userId === null || n.userId === c.user!.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);
});
on("POST", "/notifications/read-all", (c) => {
  need(c, ["ceo", "admin", "manager", "accountant", "teacher"]);
  getDb().notifications.forEach((n) => { n.read = true; });
  save();
  return { ok: true };
});

/* — Davomat / baholar — */
on("GET", "/attendance", (c) => {
  need(c, ["ceo", "admin", "manager", "teacher"]);
  const gid = Number(c.query.groupId);
  const month = c.query.month ?? "";
  if (!gid || !/^\d{4}-\d{2}$/.test(month)) fail(400, "groupId va month (YYYY-MM) kerak");
  return getDb().attendance.filter((a) => a.groupId === gid && a.date.startsWith(month));
});
on("GET", "/attendance/report", (c) => {
  need(c, ["ceo", "admin", "manager", "teacher"]);
  const date = c.query.date ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(400, "date (YYYY-MM-DD) kerak");
  const mine = new Set(visibleGroups(c).map((g) => g.id));
  return getDb().attendance.filter((a) => a.date === date && mine.has(a.groupId)).map((a) => ({ groupId: a.groupId, studentId: a.studentId, status: a.status }));
});
const teachGroup = (c: Ctx, groupId: number) => {
  const g = getDb().groups.find((x) => x.id === groupId) ?? fail(404, "Guruh topilmadi");
  if (c.user!.role === "teacher" && g.teacherId !== c.user!.id) fail(403, "Ruxsat yo'q");
  if (c.user!.role === "accountant") fail(403, "Ruxsat yo'q");
  return g;
};
on("PUT", "/attendance", (c) => {
  need(c, ["ceo", "admin", "manager", "teacher"]);
  const db = getDb();
  const { groupId, date, records } = c.body;
  teachGroup(c, groupId);
  for (const r of records ?? []) {
    const ex = db.attendance.find((a) => a.groupId === groupId && a.studentId === r.studentId && a.date === date);
    if (ex) ex.status = r.status;
    else db.attendance.push({ id: nextId("attendance"), groupId, studentId: r.studentId, date, status: r.status });
  }
  save();
  return { saved: (records ?? []).length };
});
on("DELETE", "/attendance", (c) => {
  need(c, ["ceo", "admin", "manager", "teacher"]);
  const db = getDb();
  const gid = Number(c.query.groupId), sid = Number(c.query.studentId), date = c.query.date;
  teachGroup(c, gid);
  db.attendance = db.attendance.filter((a) => !(a.groupId === gid && a.studentId === sid && a.date === date));
  save();
});
on("GET", "/grades", (c) => {
  need(c, ["ceo", "admin", "manager", "teacher"]);
  const gid = Number(c.query.groupId);
  const latest = new Map<number, number>();
  getDb().grades.filter((g) => g.groupId === gid).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id).forEach((g) => latest.set(g.studentId, g.value));
  return [...latest].map(([studentId, value]) => ({ studentId, value }));
});
on("PUT", "/grades", (c) => {
  need(c, ["ceo", "admin", "manager", "teacher"]);
  const db = getDb();
  const { groupId, studentId } = c.body;
  const value = Math.min(100, Math.max(0, Math.round(Number(c.body.value))));
  const date = c.body.date ?? todayISO();
  teachGroup(c, groupId);
  const ex = db.grades.find((g) => g.groupId === groupId && g.studentId === studentId && g.date === date);
  if (ex) ex.value = value;
  else db.grades.push({ id: nextId("grades"), groupId, studentId, value, date });
  save();
  return { groupId, studentId, value, date };
});
on("GET", "/grades/rating", (c) => {
  need(c, ["ceo", "admin", "manager", "teacher"]);
  const db = getDb();
  const mine = new Set(visibleGroups(c).map((g) => g.id));
  const acc = new Map<string, { studentId: number; name: string; group: string; sum: number; n: number }>();
  for (const r of db.grades) {
    if (!mine.has(r.groupId) || !inRange(r.date, c.query.from, c.query.to)) continue;
    const k = `${r.studentId}:${r.groupId}`;
    const cur = acc.get(k) ?? {
      studentId: r.studentId, name: db.students.find((s) => s.id === r.studentId)?.fullName ?? "", group: db.groups.find((g) => g.id === r.groupId)?.name ?? "", sum: 0, n: 0,
    };
    cur.sum += r.value;
    cur.n += 1;
    acc.set(k, cur);
  }
  return [...acc.values()].map((a) => ({ studentId: a.studentId, name: a.name, group: a.group, grade: Math.round(a.sum / a.n) }));
});

/* — Dashboard — */
const TRIAL_MS = 14 * 86_400_000;
on("GET", "/dashboard/stats", (c) => {
  need(c, FINANCE);
  const db = getDb();
  const now = Date.now();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).getTime();
  const month = todayISO().slice(0, 7);
  const left = db.enrollments.filter((e) => !e.active && e.leftAt && new Date(e.leftAt).getTime() >= monthStart);
  const leftTrial = left.filter((e) => new Date(e.leftAt!).getTime() - new Date(e.joinedAt).getTime() <= TRIAL_MS).length;
  return {
    leads: db.leads.filter((l) => ["new", "contacted", "trial"].includes(l.status)).length,
    students: db.students.filter((s) => s.active).length,
    groups: db.groups.filter((g) => g.status === "Active").length,
    debtors: db.students.filter((s) => s.active && s.balance < 0).length,
    trial: db.enrollments.filter((e) => e.active && now - new Date(e.joinedAt).getTime() <= TRIAL_MS).length,
    paid: new Set(db.payments.filter((p) => p.date.startsWith(month)).map((p) => p.studentId)).size,
    leftActive: left.length - leftTrial,
    leftTrial,
  };
});
on("GET", "/dashboard/revenue", (c) => {
  need(c, FINANCE);
  const now = new Date();
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) months.push(monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))));
  const totals = new Map(months.map((m) => [m, 0]));
  for (const p of getDb().payments) {
    const k = p.date.slice(0, 7);
    if (totals.has(k)) totals.set(k, totals.get(k)! + p.amount);
  }
  return months.map((m) => ({ month: m, value: totals.get(m)! }));
});
const DAY_KEY: Record<string, "odd" | "even" | "other"> = { "Odd days": "odd", "Even days": "even", Other: "other" };
const MON = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const shortDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MON[Number(m) - 1] ?? ""}`;
};
on("GET", "/dashboard/schedule", () => {
  const db = getDb();
  const events = db.groups
    .filter((g) => g.status === "Active" && g.roomId)
    .map((g) => {
      const course = db.courses.find((x) => x.id === g.courseId)!;
      const room = db.rooms.find((x) => x.id === g.roomId)!;
      const teacher = db.users.find((x) => x.id === g.teacherId)!;
      const [h, m] = g.lessonStartTime.split(":").map(Number);
      return {
        id: String(g.id), room: room.name, start: h * 60 + m, duration: parseInt(course.lessonDuration, 10) || 90, groupName: g.name,
        courseName: course.name, teacher: teacher.fullName, dateRange: `${shortDate(g.startDate)}—${shortDate(g.endDate)}`,
        students: db.enrollments.filter((e) => e.groupId === g.id && e.active).length, maxStudents: room.capacity, color: course.color,
        days: g.days === "Every day" ? ["odd", "even"] : [DAY_KEY[g.days] ?? "other"],
      };
    });
  return { rooms: db.rooms.map((r) => r.name), events };
});

/* ───────── Kirish nuqtasi ───────── */

function userFromToken(token: string | null): UserRow | null {
  if (!token?.startsWith("mock.")) return null;
  const id = Number(token.slice(5));
  const u = getDb().users.find((x) => x.id === id);
  return u && u.active ? u : null;
}

function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(":")) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

const PUBLIC = new Set(["POST /auth/login", "POST /public/applications"]);

export function mockRequest(method: string, rawPath: string, body: unknown, query: Query, token: string | null): unknown {
  const url = new URL(rawPath, "http://mock.local");
  const q: Query = { ...query };
  url.searchParams.forEach((v, k) => { q[k] = v; });
  const path = url.pathname;

  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const params = match(pattern, path);
    if (!params) continue;
    const user = userFromToken(token);
    if (!user && !PUBLIC.has(`${method} ${pattern}`)) throw new ApiError(401, "Avtorizatsiya talab qilinadi");
    // Xatolik bo'lsa o'zgarishlar saqlanmasligi uchun faqat muvaffaqiyatda save() chaqiriladi (handlerlar ichida)
    const out = handler({ params, body: body ?? {}, query: q, user });
    return out === undefined ? undefined : JSON.parse(JSON.stringify(out));
  }
  throw new ApiError(404, "Yo'l topilmadi");
}

