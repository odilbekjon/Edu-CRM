import { useMemo } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import type { ApiExpense } from "../../../../api";

/** Xarajatlar kategoriyalar bo'yicha */
export const Category = ({ expenses }: { expenses: ApiExpense[] }) => {
  const rows = useMemo(() => {
    const map = new Map<string, { count: number; sum: number }>();
    for (const e of expenses) {
      if (e.kind !== "expense") continue;
      const cur = map.get(e.category) ?? { count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += e.amount;
      map.set(e.category, cur);
    }
    return [...map].sort((a, b) => b[1].sum - a[1].sum);
  }, [expenses]);

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650, bgcolor: "var(--surface)", borderRadius: 3 }} aria-label="categories">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 40 }}>#</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Records</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(([name, v], i) => (
            <TableRow key={name} sx={{ "&:last-child td": { border: 0 } }}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{name}</TableCell>
              <TableCell align="right">{v.count}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{v.sum.toLocaleString("ru-RU")} UZS</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 5, color: "text.secondary" }}>
                Ma'lumot yo'q
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
