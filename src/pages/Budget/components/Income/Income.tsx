import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import type { ApiPayment } from "../../../../api";

export const Income = ({ payments }: { payments: ApiPayment[] }) => (
  <TableContainer>
    <Table sx={{ minWidth: 650, bgcolor: "var(--surface)", borderRadius: 3 }} aria-label="income">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Student</TableCell>
          <TableCell>Method</TableCell>
          <TableCell>Comment</TableCell>
          <TableCell align="right">Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id} sx={{ "&:last-child td": { border: 0 } }}>
            <TableCell>{p.date.split("-").reverse().join(".")}</TableCell>
            <TableCell>{p.student.fullName}</TableCell>
            <TableCell>{p.method}</TableCell>
            <TableCell>{p.comment ?? "—"}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {p.amount.toLocaleString("ru-RU")} UZS
            </TableCell>
          </TableRow>
        ))}
        {payments.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} align="center" sx={{ py: 5, color: "text.secondary" }}>
              Bu oyda to'lovlar yo'q
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);
