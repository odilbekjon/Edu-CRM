import { useState } from "react";
import { Button, Typography, Box, TextField } from "@mui/material";

// ── Branch rows shared across all 3 service columns ──
const BRANCHES = [
  "BePro Tashkent",
  "Young Adults Termiz",
  "New Uzbekistan",
  "YA IELTS Campus",
  "YA Grammar Campus",
];

// ── Reusable outlined card with a label in the border ──
const FieldCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      border: "1px solid var(--border)",
      borderRadius: "6px",
      pt: 1.5,
      pb: 2,
      px: 2,
      position: "relative",
      flex: 1,
    }}
  >
    <Typography
      sx={{
        position: "absolute",
        top: -10,
        left: 12,
        background: "var(--surface)",
        px: 0.5,
        fontSize: 12,
        color: "var(--muted)",
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

// ── One service-ID column (Payme / Uzum / Click) ──
const ServiceColumn = ({ title }: { title: string }) => {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(BRANCHES.map((b) => [b, ""]))
  );

  return (
    <FieldCard title={title}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 0.5 }}>
        {BRANCHES.map((branch) => (
          <Box key={branch}>
            <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.5 }}>
              {branch}
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={values[branch]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [branch]: e.target.value }))
              }
              sx={{
                background: "var(--surface)",
                "& .MuiOutlinedInput-root": { fontSize: 13 },
              }}
            />
          </Box>
        ))}
      </Box>
    </FieldCard>
  );
};

// ── Main component ──
const PaymentMethods = () => {
  const [companyLink] = useState("https://api.modme.uz/v1/payme_billing/5281");
  const [merchantId, setMerchantId] = useState("");
  const [username, setUsername] = useState("97 531 68 62");
  const [password, setPassword] = useState("····");
  const [midtransServer, setMidtransServer] = useState("");
  const [midtransClient, setMidtransClient] = useState("");

  return (
    <Box sx={{ flex: 1, p: 5, maxWidth: 1200 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "var(--ink)" }}>
        Payment methods
      </Typography>

      {/* ── Row 1: 3 service ID cards ── */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <ServiceColumn title="Payme merchant ID" />
        <ServiceColumn title="Uzum service ID" />
        <ServiceColumn title="Click service ID" />
      </Box>

      {/* ── Row 2: Payme + Midtrans ── */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {/* Payme section */}
        <FieldCard title="Payme">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5, flex: 1 }}>
            {/* Company link */}
            <Box>
              <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.5 }}>
                Company link
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={companyLink}
                InputProps={{ readOnly: true }}
                sx={{
                  background: "var(--surface-2)",
                  "& .MuiOutlinedInput-root": { fontSize: 13 },
                }}
              />
            </Box>

            {/* Paycom merchant id */}
            <Box>
              <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.5 }}>
                Paycom merchant id
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                sx={{
                  background: "var(--surface)",
                  "& .MuiOutlinedInput-root": { fontSize: 13 },
                }}
              />
            </Box>

            {/* Paycom username */}
            <Box>
              <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.5 }}>
                Paycom username
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  background: "var(--surface)",
                  "& .MuiOutlinedInput-root": { fontSize: 13 },
                }}
              />
            </Box>

            {/* Paycom password */}
            <Box>
              <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.5 }}>
                Paycom password
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  background: "var(--surface)",
                  "& .MuiOutlinedInput-root": { fontSize: 13 },
                }}
              />
            </Box>
          </Box>
        </FieldCard>

        {/* Midtrans section */}
        <Box sx={{ width: 360, flexShrink: 0 }}>
          <FieldCard title="Midtrans">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
              <Box>
                <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.5 }}>
                  MIDTRANS SERVER KEY
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={midtransServer}
                  onChange={(e) => setMidtransServer(e.target.value)}
                  sx={{
                    background: "var(--surface)",
                    "& .MuiOutlinedInput-root": { fontSize: 13 },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.5 }}>
                  MIDTRANS CLIENT KEY
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={midtransClient}
                  onChange={(e) => setMidtransClient(e.target.value)}
                  sx={{
                    background: "var(--surface)",
                    "& .MuiOutlinedInput-root": { fontSize: 13 },
                  }}
                />
              </Box>
            </Box>
          </FieldCard>
        </Box>
      </Box>

      {/* ── Save ── */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          sx={{
            background: "var(--primary)",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: "24px",
            fontSize: "0.9rem",
            "&:hover": { background: "var(--primary-dark)" },
          }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentMethods;