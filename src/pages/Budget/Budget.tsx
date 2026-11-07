import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Stack, TextField, Typography } from "@mui/material";
import { BoldTabs } from "../../components/BoldTabs";
import { Category, Expense, Income } from "./components";
import { expensesApi, paymentsApi, errorMessage, type ApiExpense, type ApiPayment } from "../../api";
import { useToast } from "../../Context/ToastContext";

/** Oy bo'yicha daromad/xarajat ko'rinishi. Ma'lumotlar backenddan keladi. */
export const Budget = () => {
  const { toast } = useToast();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [expenses, setExpenses] = useState<ApiExpense[]>([]);

  useEffect(() => {
    const from = `${month}-01`;
    const to = `${month}-31`;
    Promise.all([paymentsApi.list({ from, to }), expensesApi.list({ from, to })])
      .then(([p, e]) => {
        setPayments(p);
        setExpenses(e);
      })
      .catch((e) => toast(errorMessage(e), "error"));
  }, [month, toast]);

  const income = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);
  const spent = useMemo(
    () => expenses.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0),
    [expenses],
  );
  const fmt = (n: number) => `${n.toLocaleString("ru-RU")} UZS`;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h5">Budget</Typography>
        <TextField
          type="month"
          size="small"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          sx={{ bgcolor: "var(--surface)", borderRadius: 2.5 }}
        />
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
        {[
          { label: "Income", value: fmt(income), color: "#16a34a" },
          { label: "Expenses", value: fmt(spent), color: "#e5484d" },
          { label: "Balance", value: fmt(income - spent), color: income - spent >= 0 ? "var(--primary)" : "#e5484d" },
        ].map((c) => (
          <Paper key={c.label} elevation={0} sx={{ p: 2.5, border: "1px solid var(--border)", borderRadius: "16px" }}>
            <Typography sx={{ color: "var(--muted)", fontSize: 13, fontWeight: 500 }}>{c.label}</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 800, color: c.color, letterSpacing: "-0.02em" }}>{c.value}</Typography>
          </Paper>
        ))}
      </Box>

      <BoldTabs
        tabs={[
          { label: "Income", value: "income", children: <Income payments={payments} /> },
          { label: "Category", value: "category", children: <Category expenses={expenses} /> },
          { label: "Expense", value: "expense", children: <Expense expenses={expenses} /> },
        ]}
      />
    </Box>
  );
};
