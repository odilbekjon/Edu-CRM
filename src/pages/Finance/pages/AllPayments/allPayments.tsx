import { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Dot,
} from "recharts";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Collapse, Pagination,
} from "@mui/material";
import { FiFilter, FiChevronDown, FiChevronUp, FiInfo } from "react-icons/fi";
import { BsCash, BsGraphUp } from "react-icons/bs";
import { dashboardApi, expensesApi, paymentsApi, type ApiExpense, type ApiPayment } from "../../../../api";
import { useData } from "../../../../Context/DataContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  id: number;
  date: string;
  name: string;
  sum: number;
  methodPay: string;
  teacher: string;
  comment: string;
  creator: string;
  createdAt: string;
  groupName: string;
  course: string;
}

type SortKey = keyof Pick<Payment, "date" | "name" | "sum" | "methodPay" | "teacher" | "creator">;

// ─── Constants ────────────────────────────────────────────────────────────────

const METHOD_PAY: string[] = ["Cash", "Card", "Bank account", "Payme", "Click", "Uzum", "Humo"];
const PAGE_SIZE  = 20;

// ─── Details breakdown (method bo'yicha) ─────────────────────────────────────

const DETAIL_METHODS = ["Bank account", "Cash", "Card", "Click", "Payme", "Uzum", "Humo"] as const;

function calcDetails(payments: Payment[]) {
  const map: Record<string, number> = {
    "Bank account": 0, Cash: 0, Card: 0, Click: 0, Payme: 0, Uzum: 0, Humo: 0,
  };
  for (const p of payments) {
    if (p.methodPay in map) map[p.methodPay] += p.sum;
    else                    map["Cash"]       += p.sum;
  }
  return map;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt     = (n: number) => n.toLocaleString("ru-RU");
const fmtDate = (d: string) => d.split("-").reverse().join(".");

// ─── Reusable UI ─────────────────────────────────────────────────────────────

const Label = ({ text }: { text: string }) => (
  <label className="block text-[10px] text-muted font-medium mb-1">{text}</label>
);

const Input = ({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full border border-line rounded-md px-2 py-[7px] text-xs text-body bg-surface focus:outline-none focus:ring-1 focus:ring-[#3b5bdb]"
  />
);

const Select = ({ value, onChange, options, placeholder = "Select" }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border border-line rounded-md px-2 py-[7px] text-xs text-body bg-surface focus:outline-none focus:ring-1 focus:ring-[#3b5bdb] cursor-pointer"
  >
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const SortIcon = ({ active, dir }: { active: boolean; dir: "asc" | "desc" }) => (
  <span className={`ml-1 text-[10px] ${active ? "text-[#3b5bdb]" : "text-muted"}`}>
    {active ? (dir === "asc" ? "▲" : "▼") : "⇅"}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const toIso = (d: string) => {
  const [dd, mm, yyyy] = d.split(".");
  return dd && mm && yyyy && yyyy.length === 4 ? `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}` : "";
};
const toDot = (iso: string) => iso.split("-").reverse().join(".");

export const AllPayments = () => {
  const { teachers, groups, students } = useData();
  const [rawPayments, setRawPayments] = useState<ApiPayment[]>([]);
  const [expenses, setExpenses] = useState<ApiExpense[]>([]);
  const [chartData, setChartData] = useState<Array<{ label: string; value: number }>>([]);

  useEffect(() => {
    paymentsApi.list().then(setRawPayments).catch(() => setRawPayments([]));
    expensesApi.list().then(setExpenses).catch(() => setExpenses([]));
    dashboardApi.revenue().then((r) => setChartData(r.map((x) => ({ label: x.month, value: x.value })))).catch(() => {});
  }, []);

  const monthStart = new Date(); monthStart.setDate(1);

  // Filter
  const [dateFrom,    setDateFrom]    = useState(toDot(monthStart.toISOString().slice(0, 10)));
  const [dateTo,      setDateTo]      = useState(toDot(new Date().toISOString().slice(0, 10)));
  const [namePhone,   setNamePhone]   = useState("");
  const [group,       setGroup]       = useState("");
  const [course,      setCourse]      = useState("");
  const [teacher,     setTeacher]     = useState("");
  const [methodPay,   setMethodPay]   = useState("");
  const [sum,         setSum]         = useState("");
  const [staffName,   setStaffName]   = useState("");
  const [fromCreated, setFromCreated] = useState("");
  const [toCreated,   setToCreated]   = useState("");

  // UI state
  const [showFilters, setShowFilters] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [page,        setPage]        = useState(1);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const ALL_TEACHERS = teachers.map((t) => t.fullName);
  const ALL_GROUPS   = groups.map((g) => g.name);
  const ALL_COURSES  = [...new Set(groups.map((g) => g.course))];
  const CREATORS     = [...new Set(rawPayments.map((p) => p.createdBy?.fullName).filter(Boolean))] as string[];

  // To'lovni o'quvchining birinchi guruhi bilan boyitamiz
  const ALL_PAYMENTS: Payment[] = useMemo(() => {
    const firstRow = new Map<number, (typeof students)[number]>();
    for (const s of students) if (!firstRow.has(s.id)) firstRow.set(s.id, s);
    return rawPayments.map((p) => {
      const row = firstRow.get(p.studentId);
      return {
        id: p.id,
        date: p.date,
        name: p.student.fullName,
        sum: p.amount,
        methodPay: p.method,
        teacher: row?.teacher ?? "",
        comment: p.comment ?? "",
        creator: p.createdBy?.fullName ?? "",
        createdAt: toDot(p.date),
        groupName: row?.groupName ?? "",
        course: row?.course ?? "",
      };
    });
  }, [rawPayments, students]);

  const inRange = (iso: string) => {
    const from = toIso(dateFrom), to = toIso(dateTo);
    return (!from || iso >= from) && (!to || iso <= to);
  };
  const rangePayments = ALL_PAYMENTS.filter((p) => inRange(p.date));
  const totalRevenue = rangePayments.reduce((a, p) => a + p.sum, 0);
  const totalExpenses = expenses.filter((e) => inRange(e.date)).reduce((a, e) => a + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const details      = calcDetails(rangePayments);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    return ALL_PAYMENTS
      .filter((p) => {
        if (!inRange(p.date)) return false;
        if (staffName && p.creator !== staffName) return false;
        if (namePhone && !p.name.toLowerCase().includes(namePhone.toLowerCase())) return false;
        if (group     && p.groupName !== group)    return false;
        if (course    && p.course    !== course)   return false;
        if (teacher   && p.teacher   !== teacher)  return false;
        if (methodPay && p.methodPay !== methodPay) return false;
        if (sum       && String(p.sum) !== sum)    return false;
        return true;
      })
      .sort((a, b) => {
        const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ALL_PAYMENTS, dateFrom, dateTo, staffName, namePhone, group, course, teacher, methodPay, sum, sortKey, sortDir]);

  // Pagination
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filteredTotal = filtered.reduce((a, p) => a + p.sum, 0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const resetFilters = () => {
    setNamePhone(""); setGroup(""); setCourse(""); setTeacher("");
    setMethodPay(""); setSum(""); setStaffName(""); setFromCreated(""); setToCreated("");
    setPage(1);
  };

  return (
    <div className="p-6 min-h-screen">

      {/* ── Title ── */}
      <h1 className="text-2xl font-semibold text-ink mb-5">All payments</h1>

      {/* ── Stats + Chart ── */}
      <div className="grid grid-cols-5 gap-4 mb-5">

        {/* Left: stat cards */}
        <div className="col-span-2 flex flex-col gap-4">

          {/* Total Revenue */}
          <div className="bg-surface rounded-xl border border-line border-l-[5px] border-l-[#3b5bdb] px-6 py-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm text-muted font-medium mb-2">Total Revenue:</p>
              <p className="text-3xl font-bold text-ink tracking-tight">
                {fmt(totalRevenue)}
                <span className="text-lg font-semibold text-muted ml-2">UZS</span>
              </p>
              <p className="text-xs text-muted mt-2 flex items-center gap-1">
                📅 {dateFrom} — {dateTo}
              </p>
            </div>
            <BsCash size={40} className="text-[#3b5bdb] opacity-80 shrink-0 ml-4" />
          </div>

          {/* Total Net Profit */}
          <div className="bg-surface rounded-xl border border-line border-l-[5px] border-l-[#3b5bdb] px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted font-medium mb-2">Total Net Profit:</p>
                <p className="text-3xl font-bold text-ink tracking-tight">
                  {fmt(netProfit)}
                  <span className="text-lg font-semibold text-muted ml-2">UZS</span>
                </p>
                <p className="text-xs text-muted mt-2 flex items-center gap-1">
                  📅 {dateFrom} — {dateTo}
                </p>
              </div>
              <BsGraphUp size={38} className="text-[#3b5bdb] opacity-80 shrink-0 ml-4" />
            </div>

            {/* Details toggle */}
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="mt-4 flex items-center gap-1.5 text-xs text-muted hover:text-[#3b5bdb] transition-colors group"
            >
              <FiInfo size={13} className="group-hover:text-[#3b5bdb]" />
              <span>Details</span>
              {showDetails
                ? <FiChevronUp size={13} />
                : <FiChevronDown size={13} />}
            </button>

            {/* Details list */}
            <Collapse in={showDetails}>
              <div className="mt-3 pt-3 border-t border-line space-y-1.5">
                {DETAIL_METHODS.map((method) => (
                  <div key={method} className="flex items-center gap-2 text-sm text-body">
                    <span className="text-muted text-base leading-none">•</span>
                    <span>
                      <span className="font-medium">{method}:</span>{" "}
                      <span className="font-semibold text-ink">
                        {fmt(details[method] ?? 0)}
                      </span>{" "}
                      <span className="text-muted text-xs">UZS</span>
                    </span>
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="col-span-3 bg-surface rounded-xl border border-line p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 8, fill: "var(--muted)" }}
                interval={1}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 8, fill: "var(--muted)" }}
                tickFormatter={(v) => `${Math.round(v / 1000000)}M`}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                formatter={(v) => v !== undefined ? [`${fmt(v as number)} UZS`, "Revenue"] : null}
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid var(--border)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={<Dot r={3} fill="var(--primary)" stroke="#fff" strokeWidth={1.5} />}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div className="bg-surface rounded-xl border border-line mb-4 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-body hover:bg-surface2 transition-colors"
        >
          <span className="flex items-center gap-2">
            <FiFilter size={14} /> Filters
          </span>
          {showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>

        <Collapse in={showFilters}>
          <div className="px-5 pb-4 border-t border-line">
            {/* Row 1 */}
            <div className="grid grid-cols-8 gap-3 mt-4">
              <div><Label text="Date from" />
                <Input value={dateFrom} onChange={setDateFrom} placeholder="01.05.2026" /></div>
              <div><Label text="Date to" />
                <Input value={dateTo} onChange={setDateTo} placeholder="31.05.2026" /></div>
              <div><Label text="Name or Phone" />
                <Input value={namePhone} onChange={setNamePhone} placeholder="Search..." /></div>
              <div><Label text="Select group" />
                <Select value={group} onChange={setGroup} options={ALL_GROUPS} /></div>
              <div><Label text="Course" />
                <Select value={course} onChange={setCourse} options={ALL_COURSES} /></div>
              <div><Label text="Teacher" />
                <Select value={teacher} onChange={setTeacher} options={ALL_TEACHERS} /></div>
              <div><Label text="Method pay" />
                <Select value={methodPay} onChange={setMethodPay} options={[...METHOD_PAY]} /></div>
              <div><Label text="Sum" />
                <Input value={sum} onChange={setSum} placeholder="Amount" /></div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-8 gap-3 mt-3 items-end">
              <div><Label text="Staff Name" />
                <Select value={staffName} onChange={setStaffName} options={CREATORS} /></div>
              <div><Label text="From created date" />
                <Input value={fromCreated} onChange={setFromCreated} placeholder="No date selected" /></div>
              <div><Label text="To created date" />
                <Input value={toCreated} onChange={setToCreated} placeholder="No date selected" /></div>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 border border-line rounded-md py-[7px] text-xs text-muted hover:bg-surface2 transition-colors"
                >
                  Reset
                </button>
                <button
                  className="flex-1 bg-[#3b5bdb] text-white rounded-md py-[7px] text-xs font-medium hover:bg-[#2f49b5] transition-colors"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
        </Collapse>
      </div>

      {/* ── Table ── */}
      <div className="bg-surface rounded-xl border border-line overflow-hidden shadow-sm">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "var(--surface-2)" }}>
                {(
                  [
                    { key: "date",      label: "Date" },
                    { key: "name",      label: "Name" },
                    { key: "sum",       label: "Sum" },
                    { key: "methodPay", label: "Method pay" },
                    { key: "teacher",   label: "Teacher" },
                    { key: null,        label: "Comment" },
                    { key: "creator",   label: "Creator" },
                  ] as { key: SortKey | null; label: string }[]
                ).map(({ key, label }) => (
                  <TableCell
                    key={label}
                    onClick={() => key && handleSort(key)}
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: "var(--text)",
                      cursor: key ? "pointer" : "default",
                      whiteSpace: "nowrap",
                      borderBottom: "2px solid var(--border)",
                      py: 1.5,
                      userSelect: "none",
                    }}
                  >
                    {label}
                    {key && <SortIcon active={sortKey === key} dir={sortDir} />}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((p, i) => {
                const rowNum = (page - 1) * PAGE_SIZE + i + 1;
                return (
                  <TableRow
                    key={p.id}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "var(--primary-tint) !important" },
                      backgroundColor: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                    }}
                  >
                    <TableCell sx={{ fontSize: 12, py: 1.2, whiteSpace: "nowrap", fontWeight: 500, color: "var(--text)" }}>
                      {rowNum}. {fmtDate(p.date)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, py: 1.2, color: "var(--text)" }}>
                      {p.name}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, py: 1.2, whiteSpace: "nowrap" }}>
                      <span className="font-semibold text-ink">{fmt(p.sum)}</span>
                      <span className="text-[11px] text-muted ml-1">UZS</span>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, py: 1.2, color: "var(--text)" }}>
                      {p.methodPay}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, py: 1.2, color: "var(--text)" }}>
                      {p.teacher}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, py: 1.2 }}>
                      <span className="bg-surface2 border border-line rounded px-2 py-[2px] text-[11px] text-body whitespace-nowrap">
                        {p.comment}
                      </span>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, py: 1.2 }}>
                      <span className="text-body text-xs">{p.creator}</span>
                      <br />
                      <span className="text-[11px] text-muted">{p.createdAt}</span>
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "var(--muted)", fontSize: 13 }}>
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer: total + pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-line">
          <span className="text-xs text-muted">
            Showing{" "}
            <strong className="text-body">
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </strong>{" "}
            of <strong className="text-body">{filtered.length}</strong> payments
            {" · "}
            <span className="font-semibold text-[#3b5bdb]">{fmt(filteredTotal)} UZS</span>
          </span>

          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              size="small"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: 12,
                  color: "var(--text)",
                },
                "& .Mui-selected": {
                  backgroundColor: "var(--primary) !important",
                  color: "#fff !important",
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};