// Brauzer ichidagi demo "ma'lumotlar bazasi" (localStorage). Backend yo'q — hamma narsa shu yerda saqlanadi.
// Keyinchalik haqiqiy backend ulanganda faqat src/api/client.ts dagi USE_MOCK o'chiriladi.

export interface UserRow {
  id: number; uid: string; fullName: string; phone: string; password: string;
  email: string | null; telegram: string | null; role: string; dob: string | null; gender: string | null;
  percent: number | null; active: boolean; branchId: number | null;
}
export interface BranchRow { id: number; name: string; address: string | null; phone: string | null }
export interface CourseRow {
  id: number; name: string; code: string | null; price: number; color: string;
  lessonDuration: string; courseDuration: number; description: string;
}
export interface RoomRow { id: number; name: string; capacity: number; branchId: number | null }
export interface GroupRow {
  id: number; name: string; badge: string; badgeColor: string; startDate: string; endDate: string;
  days: string; lessonStartTime: string; price: number; status: string; tags: string[];
  courseId: number; teacherId: number; roomId: number | null; branchId: number | null;
}
export interface StudentRow {
  id: number; fullName: string; phone: string; phone2: string | null; dob: string | null; gender: string | null;
  comment: string | null; balance: number; active: boolean; branchId: number | null; createdAt: string;
}
export interface EnrollmentRow { id: number; studentId: number; groupId: number; active: boolean; joinedAt: string; leftAt: string | null }
export interface PaymentRow {
  id: number; studentId: number; amount: number; method: string; date: string; comment: string | null;
  createdById: number | null; branchId: number | null;
}
export interface ChargeRow {
  id: number; studentId: number; groupId: number | null; amount: number; date: string;
  period: string | null; comment: string | null; createdById: number | null;
}
export interface ExpenseRow {
  id: number; title: string; category: string; amount: number; date: string; comment: string | null;
  payee: string | null; method: string; kind: "expense" | "refund"; branchId: number | null;
}
export interface LeadRow {
  id: number; name: string; phone: string; source: string | null; status: string; comment: string | null;
  courseId: number | null; branchId: number | null; createdAt: string;
}
export interface ReminderRow {
  id: number; title: string; note: string | null; dueAt: string; done: boolean; tags: string | null;
  userId: number | null; assigneeId: number | null; studentId: number | null; groupId: number | null;
}
export interface NotificationRow { id: number; text: string; read: boolean; userId: number | null; createdAt: string }
export interface AttendanceRow { id: number; groupId: number; studentId: number; date: string; status: string }
export interface GradeRow { id: number; groupId: number; studentId: number; value: number; date: string }

export interface DB {
  seq: Record<string, number>;
  users: UserRow[]; branches: BranchRow[]; courses: CourseRow[]; rooms: RoomRow[]; groups: GroupRow[];
  students: StudentRow[]; enrollments: EnrollmentRow[]; payments: PaymentRow[]; charges: ChargeRow[];
  expenses: ExpenseRow[]; leads: LeadRow[]; reminders: ReminderRow[]; notifications: NotificationRow[];
  attendance: AttendanceRow[]; grades: GradeRow[];
}

const KEY = "crm_mock_db_v2";

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

/* ───────── Boshlang'ich (demo) ma'lumotlar ───────── */

const digits = (s: string) => {
  const d = s.replace(/\D/g, "");
  return d.length > 9 && d.startsWith("998") ? d.slice(3) : d;
};

function seed(): DB {
  const db: DB = {
    seq: {}, users: [], branches: [], courses: [], rooms: [], groups: [], students: [], enrollments: [],
    payments: [], charges: [], expenses: [], leads: [], reminders: [], notifications: [], attendance: [], grades: [],
  };
  const id = (t: string) => (db.seq[t] = (db.seq[t] ?? 0) + 1);

  // Filiallar
  const branch: Record<string, number> = {};
  for (const name of ["YA IELTS Campus", "Main Campus", "West Branch"]) {
    const b = { id: id("branches"), name, address: null, phone: null };
    db.branches.push(b);
    branch[name] = b.id;
  }

  // Kurslar
  const course: Record<string, number> = {};
  const COURSES: Array<[string, string, number, string, string, number, string]> = [
    ["English", "ENG-001", 500000, "#4f7cff", "90 minutes", 6, "General English"],
    ["IELTS", "IEL-002", 800000, "#a78bfa", "90 minutes", 4, "IELTS tayyorlov"],
    ["Korean", "KOR-003", 600000, "#f46b8a", "90 minutes", 6, "Koreys tili"],
    ["SAT", "SAT-004", 900000, "#34d399", "120 minutes", 7, "SAT Math"],
    ["English Speaking", "SPK-005", 400000, "#f59e0b", "60 minutes", 5, "Speaking club"],
  ];
  for (const [name, code, price, color, lessonDuration, courseDuration, description] of COURSES) {
    const c = { id: id("courses"), name, code, price, color, lessonDuration, courseDuration, description };
    db.courses.push(c);
    course[name] = c.id;
  }

  // Xonalar
  const room: Record<string, number> = {};
  const ROOMS: Array<[string, number, string]> = [
    ["1-xona", 20, "Main Campus"], ["2-xona", 15, "YA IELTS Campus"], ["3-xona", 25, "YA IELTS Campus"],
    ["4-xona", 15, "Main Campus"], ["5-xona", 20, "YA IELTS Campus"], ["7-xona", 20, "YA IELTS Campus"],
  ];
  for (const [name, capacity, br] of ROOMS) {
    const r = { id: id("rooms"), name, capacity, branchId: branch[br] };
    db.rooms.push(r);
    room[name] = r.id;
  }

  // CEO
  db.users.push({
    id: id("users"), uid: "1000001", fullName: "Odilbek Safarov", phone: "915179774", password: "1111",
    email: null, telegram: null, role: "ceo", dob: null, gender: "Male", percent: null, active: true,
    branchId: branch["YA IELTS Campus"],
  });

  type G = {
    name: string; badge: string; badgeColor: string; start: string; end: string; days: string; time: string;
    room: string; course: string; price: number; students: Array<[string, string, boolean]>;
  };
  const DEMO: Array<{ t: [string, string, string, number, string, string, string?]; groups: G[] }> = [
    {
      t: ["Pardayev Jahongir", "93 986 66 76", "@pardayev", 20, "Male", "YA IELTS Campus", "1995-06-14"],
      groups: [
        {
          name: "KIDS English", badge: "English Planet", badgeColor: "blue", start: "2026-04-15", end: "2026-09-15",
          days: "Odd days", time: "11:00", room: "5-xona", course: "English", price: 500000,
          students: [
            ["Bo'ronov Oybek", "(77) 022-25-04", true], ["Xo'shboqova Charos", "(97) 242-14-80", true],
            ["Eshboyev Abdulla", "(93) 846-41-46", true], ["Baxtiyorova Shahribonu", "(93) 600-92-25", true],
            ["Jumayev Asror", "(94) 167-67-17", true], ["O'tashev Asror", "(94) 713-82-84", true],
            ["Nortojiyeva Nafosat", "(91) 588-14-05", true], ["Ostanaqulova Marjona", "(99) 015-93-11", true],
            ["Turdimurodova Xumora", "(94) 543-33-87", true], ["Turdimurodov Asadbek", "(94) 543-33-87", true],
            ["Eshmo'minova Yasira", "(94) 386-67-00", true],
          ],
        },
        {
          name: "IELTS", badge: "CRAM", badgeColor: "green", start: "2026-04-13", end: "2026-12-13",
          days: "Odd days", time: "16:00", room: "3-xona", course: "IELTS", price: 800000,
          students: [
            ["Aliyev Bobur", "(90) 123-45-67", true], ["Karimova Dilnoza", "(93) 234-56-78", true],
            ["Toshmatov Jasur", "(94) 345-67-89", false], ["Nazarova Kamola", "(95) 456-78-90", true],
            ["Ergashev Temur", "(94) 333-44-55", true],
          ],
        },
        {
          name: "Koreys tili", badge: "New group", badgeColor: "amber", start: "2026-04-13", end: "2026-08-13",
          days: "Odd days", time: "14:00", room: "2-xona", course: "Korean", price: 600000,
          students: [
            ["Yusupov Sherzod", "(91) 456-78-90", true], ["Nazarova Zulfiya", "(95) 567-89-01", true],
            ["Holiqova Munira", "(93) 678-90-12", true],
          ],
        },
      ],
    },
    {
      t: ["Rahimova Dilnoza", "90 123 45 67", "@rahimova_d", 15, "Female", "Main Campus"],
      groups: [
        {
          name: "General English", badge: "Beginner", badgeColor: "blue", start: "2026-04-01", end: "2026-10-01",
          days: "Even days", time: "09:00", room: "1-xona", course: "English", price: 450000,
          students: [["Sobirov Amir", "(90) 111-22-33", true], ["Holiqova Munira", "(93) 678-90-12", true]],
        },
      ],
    },
    {
      t: ["Toshmatov Jasur", "94 234 56 78", "@jasur_t", 18, "Male", "YA IELTS Campus"],
      groups: [
        {
          name: "SAT Math", badge: "Intensive", badgeColor: "amber", start: "2026-04-10", end: "2026-11-10",
          days: "Odd days", time: "14:00", room: "7-xona", course: "SAT", price: 900000,
          students: [
            ["Ergashev Temur", "(94) 333-44-55", true], ["Nazarova Kamola", "(95) 456-78-90", true],
            ["Abdullayev Sanjar", "(97) 555-66-77", false],
          ],
        },
      ],
    },
    { t: ["Karimov Ulugbek", "91 345 67 89", "@ulugbek_k", 12, "Male", "West Branch"], groups: [] },
    {
      t: ["Yusupova Malika", "95 456 78 90", "@malika_y", 22, "Female", "Main Campus"],
      groups: [
        {
          name: "Speaking Club", badge: "Advanced", badgeColor: "green", start: "2026-04-05", end: "2026-09-05",
          days: "Every day", time: "18:00", room: "4-xona", course: "English Speaking", price: 400000,
          students: [["Rakhimov Sanjar", "(91) 666-77-88", true], ["Ismoilova Nargiza", "(93) 777-88-99", true]],
        },
      ],
    },
  ];

  let uid = 1591260;
  const studentByKey = new Map<string, number>();
  for (const { t, groups } of DEMO) {
    const [fullName, phone, telegram, percent, gender, br, dob] = t;
    const teacher: UserRow = {
      id: id("users"), uid: String(uid++), fullName, phone: digits(phone), password: "1111", email: null,
      telegram, role: "teacher", dob: dob ?? null, gender, percent, active: true, branchId: branch[br],
    };
    db.users.push(teacher);
    for (const g of groups) {
      const group: GroupRow = {
        id: id("groups"), name: g.name, badge: g.badge, badgeColor: g.badgeColor, startDate: g.start, endDate: g.end,
        days: g.days, lessonStartTime: g.time, price: g.price, status: "Active", tags: [],
        courseId: course[g.course], teacherId: teacher.id, roomId: room[g.room], branchId: branch[br],
      };
      db.groups.push(group);
      for (const [name, ph, active] of g.students) {
        const key = `${name}|${digits(ph)}`;
        let sid = studentByKey.get(key);
        if (!sid) {
          sid = id("students");
          db.students.push({
            id: sid, fullName: name, phone: digits(ph), phone2: null, dob: null, gender: null, comment: null,
            balance: 0, active: true, branchId: branch[br], createdAt: new Date().toISOString(),
          });
          studentByKey.set(key, sid);
        }
        db.enrollments.push({
          id: id("enrollments"), studentId: sid, groupId: group.id, active,
          joinedAt: new Date(g.start).toISOString(), leftAt: active ? null : new Date().toISOString(),
        });
      }
    }
  }

  // To'lovlar: oxirgi 6 oy bo'yicha taqsimlanadi (dashboard grafigi uchun); har uchinchi o'quvchi qarzdor
  const methods = ["Cash", "Card", "Click", "Payme"];
  db.students.forEach((s, i) => {
    if (i % 3 === 2) {
      s.balance = -300000;
      return;
    }
    const count = 2 + (i % 4);
    let total = 0;
    for (let k = 0; k < count; k++) {
      const amount = 400000 + ((i + k) % 4) * 100000;
      db.payments.push({
        id: id("payments"), studentId: s.id, amount, method: methods[(i + k) % methods.length],
        date: daysAgo(k * 30 + (i % 25)), comment: null, createdById: 1, branchId: s.branchId,
      });
      total += amount;
    }
    s.balance = total - 500000;
  });

  // Xarajatlar
  const EXP: Array<[string, string, number]> = [
    ["Ijara", "Rent", 3_000_000], ["Kommunal to'lovlar", "Utilities", 600_000], ["Marketing (Instagram)", "Marketing", 800_000],
  ];
  for (let m = 0; m < 4; m++) {
    for (const [title, category, amount] of EXP) {
      db.expenses.push({
        id: id("expenses"), title, category, amount, date: daysAgo(m * 30 + 5), comment: null, payee: null,
        method: "Cash", kind: "expense", branchId: null,
      });
    }
  }

  // Lead'lar
  const LEADS: Array<[string, string, string, string, string]> = [
    ["Sardor Aliyev", "901112233", "Instagram", "new", "IELTS"],
    ["Madina Qodirova", "935556677", "Telegram", "contacted", "English"],
    ["Bekzod Rustamov", "977778899", "Referral", "trial", "SAT"],
    ["Aziza Karimova", "909990011", "Website", "new", "Korean"],
  ];
  for (const [name, phone, source, status, c] of LEADS) {
    db.leads.push({
      id: id("leads"), name, phone, source, status, comment: null, courseId: course[c], branchId: null,
      createdAt: new Date(Date.now() - db.leads.length * 5 * 86_400_000).toISOString(),
    });
  }

  db.reminders.push({
    id: id("reminders"), title: "Qarzdor o'quvchilarga qo'ng'iroq qilish", note: "Oy oxirigacha", tags: "Finance",
    dueAt: `${daysAgo(-1)}T10:00`, done: false, userId: 1, assigneeId: 1, studentId: null, groupId: null,
  });
  db.notifications.push(
    { id: id("notifications"), text: "CRM tizimiga xush kelibsiz!", read: false, userId: null, createdAt: new Date().toISOString() },
    { id: id("notifications"), text: "Demo ma'lumotlar yuklandi.", read: false, userId: null, createdAt: new Date().toISOString() },
  );
  return db;
}

/* ───────── Saqlash ───────── */

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch {
    /* buzilgan yoki bloklangan storage — qaytadan boshlaymiz */
  }
  return seed();
}

let db: DB = load();

export const getDb = () => db;
export const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* private mode */
  }
};
export const nextId = (table: string) => (db.seq[table] = (db.seq[table] ?? 0) + 1);

/** Demo ma'lumotlarni boshlang'ich holatga qaytaradi */
export const resetMockDb = () => {
  db = seed();
  save();
};
