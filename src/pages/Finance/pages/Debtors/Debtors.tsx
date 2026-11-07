import { useMemo, useState, useRef, useEffect } from "react";
import { BsCashStack } from "react-icons/bs";
import { FiFilter, FiCalendar, FiChevronDown, FiMail } from "react-icons/fi";
import { IoTimeOutline } from "react-icons/io5";
import { IoMdFlag } from "react-icons/io";
import { useData } from "../../../../Context/DataContext";

// ---------- Types ----------
interface DebtorRow {
  uid: string;
  id: number;
  name: string;
  phone: string;
  active: boolean;
  groupId: number;
  groupName: string;
  groupBadge: string;
  groupBadgeColor: "blue" | "green" | "amber";
  groupSchedule: string;
  teacher: string;
  branch: string;
  balance: number;
  totalOnPeriod: number;
  comment: string;
  task: string;
  status: string;
}

// ---------- Constants ----------
const STATUSES = ["Active (Not archived)", "Archived", "All"];
const PAGE_SIZE_OPTIONS = [20, 25, 50];

// ---------- Helpers ----------
const formatUZS = (n: number) => n.toLocaleString("uz-UZ") + " UZS";

// ---------- Small components ----------
const SelectBox = ({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-line rounded px-3 py-1.5 text-sm bg-surface text-left hover:border-line transition-colors min-w-[140px]"
      >
        <span className={value ? "text-ink" : "text-muted"}>
          {value || placeholder || "Select"}
        </span>
        <FiChevronDown size={13} className="text-muted ml-2 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-surface border border-line rounded-lg shadow-lg z-50 min-w-full py-1">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-body hover:bg-surface2 transition-colors whitespace-nowrap"
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchByDropdown = ({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const opts = ["Name", "Phone", "Group"];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 border border-line rounded-l px-3 py-1.5 text-sm bg-surface2 hover:bg-surface2 text-body transition-colors border-r-0"
      >
        Search by {value} <FiChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-surface border border-line rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
          {opts.map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-body hover:bg-surface2"
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Badge color helper ----------
const badgeCls = (color: "blue" | "green" | "amber") => {
  if (color === "blue") return "bg-blue-100 text-blue-700";
  if (color === "green") return "bg-green-100 text-green-700";
  return "bg-amber-100 text-amber-700";
};

// ---------- Main Component ----------
export const Debtors = () => {
  const { students } = useData();

  // Qarzdorlar — balansi manfiy bo'lgan o'quvchilar
  const DEBTORS_DATA: DebtorRow[] = useMemo(
    () =>
      students
        .filter((s) => s.balance < 0)
        .map((s) => ({
          uid: s.uid,
          id: s.id,
          name: s.name,
          phone: s.phone,
          active: s.active,
          groupId: s.groupId,
          groupName: s.groupName,
          groupBadge: s.groupBadge,
          groupBadgeColor: s.groupBadgeColor,
          groupSchedule: s.groupSchedule,
          teacher: s.teacher,
          branch: s.branch,
          balance: s.balance,
          totalOnPeriod: s.balance,
          comment: s.comment ?? "",
          task: "",
          status: s.active ? "Active (Not archived)" : "Archived",
        })),
    [students],
  );
  const GROUP_OPTIONS = useMemo(() => [...new Set(DEBTORS_DATA.map((d) => d.groupName))], [DEBTORS_DATA]);

  const [searchBy, setSearchBy] = useState("Name");
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("Active (Not archived)");
  const [group, setGroup] = useState("");
  const [debtFrom, setDebtFrom] = useState("");
  const [debtTo, setDebtTo] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [task, setTask] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    searchBy: "Name",
    searchText: "",
    status: "Active (Not archived)",
    group: "",
    debtFrom: "",
    debtTo: "",
  });
  const [selected, setSelected] = useState<string[]>([]); // uid based
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ---------- Filter ----------
  const filtered = DEBTORS_DATA.filter((d) => {
    if (activeFilters.searchText) {
      const val = activeFilters.searchText.toLowerCase();
      if (activeFilters.searchBy === "Name" && !d.name.toLowerCase().includes(val)) return false;
      if (activeFilters.searchBy === "Phone" && !d.phone.includes(val)) return false;
      if (activeFilters.searchBy === "Group" && !d.groupName.toLowerCase().includes(val)) return false;
    }
    if (activeFilters.group && d.groupName !== activeFilters.group) return false;
    if (activeFilters.status !== "All" && d.status !== activeFilters.status) return false;
    if (activeFilters.debtFrom && d.balance > Number(activeFilters.debtFrom)) return false;
    if (activeFilters.debtTo && d.balance < Number(activeFilters.debtTo)) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalBalance = filtered.reduce((a, d) => a + d.balance, 0);
  const totalPeriod = filtered.reduce((a, d) => a + d.totalOnPeriod, 0);

  const allChecked = paginated.length > 0 && paginated.every((d) => selected.includes(d.uid));
  const toggleAll = () => {
    if (allChecked) setSelected((s) => s.filter((uid) => !paginated.find((d) => d.uid === uid)));
    else setSelected((s) => [...new Set([...s, ...paginated.map((d) => d.uid)])]);
  };
  const toggleOne = (uid: string) =>
    setSelected((s) => s.includes(uid) ? s.filter((x) => x !== uid) : [...s, uid]);

  const handleFilter = () => {
    setActiveFilters({ searchBy, searchText, status, group, debtFrom, debtTo });
    setPage(1);
  };

  const inputCls =
    "border border-line rounded px-3 py-1.5 text-sm bg-surface focus:outline-none focus:border-blue-400 w-full";

  return (
    <div className="min-h-screen p-6 font-sans">
      {/* Title */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-semibold text-ink">Debtors</h1>
        <span className="text-sm text-muted">Quantity — {filtered.length}</span>
      </div>

      {/* Summary cards */}
      <div className="bg-surface border border-line rounded-lg px-6 py-4 flex items-center justify-between mb-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-1 h-7 bg-blue-500 rounded-full mr-1" />
          <span className="text-body font-medium">Total: {formatUZS(totalBalance)}</span>
        </div>
        <BsCashStack className="text-blue-400 text-2xl" />
      </div>
      <div className="bg-surface border border-line rounded-lg px-6 py-4 flex items-center justify-between mb-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-1 h-7 bg-blue-500 rounded-full mr-1" />
          <span className="text-body font-medium">Total on period: {formatUZS(totalPeriod)}</span>
        </div>
        <BsCashStack className="text-blue-400 text-2xl" />
      </div>

      {/* Filter panel */}
      <div className="bg-surface border border-line rounded-lg px-5 py-4 mb-4 shadow-sm">
        {/* Row 1 */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          <div className="col-span-1">
            <label className="text-xs text-muted mb-1 block">Search</label>
            <div className="flex">
              <SearchByDropdown value={searchBy} onChange={setSearchBy} />
              <input
                type="text"
                className="flex-1 border border-line rounded-r px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Status</label>
            <SelectBox value={status} onChange={setStatus} options={STATUSES} placeholder="Active (Not archived)" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Group</label>
            <SelectBox value={group} onChange={setGroup} options={GROUP_OPTIONS} placeholder="Select" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Debt amount (from)</label>
            <SelectBox
              value={debtFrom}
              onChange={setDebtFrom}
              options={["-100000", "-200000", "-300000", "-400000"]}
              placeholder="Select"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Debt amount (to)</label>
            <SelectBox
              value={debtTo}
              onChange={setDebtTo}
              options={["-100000", "-200000", "-300000", "-400000"]}
              placeholder="Select"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex items-end gap-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Date from</label>
            <div className="relative">
              <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" size={13} />
              <input
                type="text"
                className={inputCls + " pl-7 w-44"}
                placeholder="No date selected"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Date to</label>
            <div className="relative">
              <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" size={13} />
              <input
                type="text"
                className={inputCls + " pl-7 w-44"}
                placeholder="No date selected"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Task</label>
            <SelectBox value={task} onChange={setTask} options={["Task 1", "Task 2", "Task 3"]} placeholder="Select" />
          </div>
          <button
            onClick={handleFilter}
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-6 py-1.5 text-sm font-medium transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Table toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Rows per page:</span>
          <select
            className="border border-line rounded px-2 py-1 text-sm bg-surface focus:outline-none"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        <button className="flex items-center gap-2 border border-line rounded px-3 py-1.5 text-sm text-body bg-surface hover:bg-surface2 transition-colors">
          <FiFilter size={13} /> Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface2">
              <th className="px-4 py-3 w-8">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="rounded accent-blue-600" />
              </th>
              <th className="px-3 py-3 text-left text-muted font-medium w-8">#</th>
              <th className="px-3 py-3 text-left text-muted font-medium">Name</th>
              <th className="px-3 py-3 text-left text-muted font-medium">Phone</th>
              <th className="px-3 py-3 text-left text-muted font-medium">Balance</th>
              <th className="px-3 py-3 text-left text-muted font-medium">Total on period</th>
              <th className="px-3 py-3 text-left text-muted font-medium">Group</th>
              <th className="px-3 py-3 text-left text-muted font-medium">Comment</th>
              <th className="px-3 py-3 text-left text-muted font-medium">Task</th>
              <th className="px-3 py-3 text-left text-muted font-medium">Status</th>
              <th className="px-3 py-3 w-8">
                <FiMail size={15} className="text-yellow-500" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-10 text-muted">No Data</td>
              </tr>
            ) : (
              paginated.map((d, i) => (
                <tr key={d.uid} className="border-b border-line hover:bg-surface2 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(d.uid)}
                      onChange={() => toggleOne(d.uid)}
                      className="rounded accent-blue-600"
                    />
                  </td>
                  <td className="px-3 py-3 text-muted text-xs">{(page - 1) * pageSize + i + 1}.</td>
                  <td className="px-3 py-3 font-medium text-ink whitespace-nowrap">{d.name}</td>
                  <td className="px-3 py-3 text-body whitespace-nowrap">{d.phone}</td>
                  <td className="px-3 py-3 text-body whitespace-nowrap">{formatUZS(d.balance)}</td>
                  <td className="px-3 py-3 text-body whitespace-nowrap">{formatUZS(d.totalOnPeriod)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${badgeCls(d.groupBadgeColor)}`}>
                        {d.groupBadge}
                      </span>
                      <span className="text-body text-xs whitespace-nowrap">
                        {d.groupName} ({d.teacher} · {d.groupSchedule})
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                      {d.name.charAt(0)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <IoTimeOutline size={18} className="text-orange-400" />
                  </td>
                  <td className="px-3 py-3">
                    <IoMdFlag size={18} className={d.active ? "text-green-500" : "text-muted"} />
                  </td>
                  <td className="px-3 py-3" />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-2 py-1 rounded text-sm border border-line bg-surface text-body hover:bg-surface2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">«</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 rounded text-sm border border-line bg-surface text-body hover:bg-surface2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              let p: number;
              if (totalPages <= 5) p = idx + 1;
              else if (page <= 3) p = idx + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + idx;
              else p = page - 2 + idx;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    page === p ? "bg-blue-700 border-blue-700 text-white" : "border-line bg-surface text-body hover:bg-surface2"
                  }`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 rounded text-sm border border-line bg-surface text-body hover:bg-surface2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-2 py-1 rounded text-sm border border-line bg-surface text-body hover:bg-surface2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">»</button>
          </div>
        </div>
      )}
    </div>
  );
};