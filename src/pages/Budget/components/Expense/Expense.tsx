import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import type { ApiExpense } from "../../../../api";

export const Expense = ({ expenses }: { expenses: ApiExpense[] }) => (
  <TableContainer>
    <Table sx={{ minWidth: 650, bgcolor: "var(--surface)", borderRadius: 3 }} aria-label="expenses">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Category</TableCell>
          <TableCell>Payee</TableCell>
          <TableCell align="right">Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {expenses.map((e) => (
          <TableRow key={e.id} sx={{ "&:last-child td": { border: 0 } }}>
            <TableCell>{e.date.split("-").reverse().join(".")}</TableCell>
            <TableCell>{e.title}{e.kind === "refund" ? " (refund)" : ""}</TableCell>
            <TableCell>{e.category}</TableCell>
            <TableCell>{e.payee ?? "—"}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {e.amount.toLocaleString("ru-RU")} UZS
            </TableCell>
          </TableRow>
        ))}
        {expenses.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} align="center" sx={{ py: 5, color: "text.secondary" }}>
              Bu oyda xarajatlar yo'q
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);
