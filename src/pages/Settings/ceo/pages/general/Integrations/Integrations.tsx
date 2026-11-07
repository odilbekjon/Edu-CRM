import { useState } from "react";
import { Button, Typography, Box, TextField } from "@mui/material";
import { MdOutlineWifiOff } from "react-icons/md";

// ── Outlined card with border-label ──
const FieldCard = ({
  title,
  children,
  sx = {},
}: {
  title: string;
  children: React.ReactNode;
  sx?: object;
}) => (
  <Box
    sx={{
      border: "1px solid var(--border)",
      borderRadius: "6px",
      pt: 2,
      pb: 3,
      px: 2.5,
      position: "relative",
      ...sx,
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

// ── Integration row (Facebook / amoCRM) ──
const IntegrationRow = ({
  icon,
  name,
  description,
  iconBg,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  iconBg: string;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      py: 2.5,
      borderBottom: "1px solid var(--border)",
    }}
  >
    {/* Icon */}
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "10px",
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mr: 2,
      }}
    >
      {icon}
    </Box>

    {/* Text */}
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
        {name}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.3 }}>
        {description}
      </Typography>
    </Box>

    {/* Status */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}>
      <MdOutlineWifiOff size={16} color="var(--muted)" />
      <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>Not Connected</Typography>
    </Box>

    {/* Connect button */}
    <Button
      variant="contained"
      sx={{
        background: "var(--primary)",
        textTransform: "none",
        fontWeight: 600,
        px: 3,
        py: 0.8,
        borderRadius: "6px",
        fontSize: "0.85rem",
        "&:hover": { background: "var(--primary-dark)" },
      }}
    >
      Connect
    </Button>
  </Box>
);

const Integrations = () => {
  const [worklyClientId, setWorklyClientId] = useState("");
  const [worklySecret, setWorklySecret] = useState("");
  const [worklyUsername, setWorklyUsername] = useState("97 531 68 62");
  const [worklyPassword, setWorklyPassword] = useState("••••••••");
  const [telegramReport, setTelegramReport] = useState("221328107");
  const [facebookPixel, setFacebookPixel] = useState("");
  const [telegram, setTelegram] = useState("");

  return (
    <Box sx={{ flex: 1, p: 5, maxWidth: 1200 }}>

      {/* ── Connected Integrations ── */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--ink)" }}>
        Connected Integrations
      </Typography>
      <Typography sx={{ fontSize: 13, color: "var(--muted)", mb: 3 }}>
        Connect and manage your social media accounts and CRM systems
      </Typography>

      <Box sx={{ mb: 4 }}>
        <IntegrationRow
          iconBg="#1877f2"
          icon={
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>f</Typography>
          }
          name="Facebook Page"
          description="Connect your Facebook business page"
        />
        <IntegrationRow
          iconBg="#00c853"
          icon={
            <Box
              sx={{
                width: 26,
                height: 26,
                border: "2.5px solid #fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 2,
                  background: "var(--surface)",
                  borderRadius: 1,
                  transform: "rotate(-45deg) translate(1px, 1px)",
                }}
              />
            </Box>
          }
          name="amoCRM | Kommo"
          description="Sync leads with your amoCRM | Kommo account"
        />
      </Box>

      {/* ── Row: Workly + Telegram Reports ── */}
      <Box sx={{ display: "flex", gap: 3, mb: 3, alignItems: "flex-start" }}>

        {/* Workly */}
        <FieldCard title="Workly" sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 0.5 }}>
            <Box>
              <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.8 }}>
                Workly client id
              </Typography>
              <TextField
                fullWidth size="small" value={worklyClientId}
                onChange={(e) => setWorklyClientId(e.target.value)}
                sx={{ background: "var(--surface)", "& .MuiOutlinedInput-root": { fontSize: 13 } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.8 }}>
                Workly secret
              </Typography>
              <TextField
                fullWidth size="small" value={worklySecret}
                onChange={(e) => setWorklySecret(e.target.value)}
                sx={{ background: "var(--surface)", "& .MuiOutlinedInput-root": { fontSize: 13 } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.8 }}>
                Workly username
              </Typography>
              <TextField
                fullWidth size="small" value={worklyUsername}
                onChange={(e) => setWorklyUsername(e.target.value)}
                sx={{ background: "var(--surface)", "& .MuiOutlinedInput-root": { fontSize: 13 } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.8 }}>
                Workly password
              </Typography>
              <TextField
                fullWidth size="small" type="password" value={worklyPassword}
                onChange={(e) => setWorklyPassword(e.target.value)}
                sx={{ background: "var(--surface)", "& .MuiOutlinedInput-root": { fontSize: 13 } }}
              />
            </Box>
          </Box>
        </FieldCard>

        {/* Telegram Reports */}
        <FieldCard title="Telegram Reports" sx={{ flex: 1 }}>
          <Box sx={{ mt: 0.5 }}>
            <TextField
              fullWidth size="small" value={telegramReport}
              onChange={(e) => setTelegramReport(e.target.value)}
              sx={{ mb: 2.5, background: "var(--surface)", "& .MuiOutlinedInput-root": { fontSize: 13 } }}
            />

            <Box
              sx={{
                border: "1px solid var(--border)",
                borderRadius: "6px",
                p: 2,
                background: "var(--surface-2)",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 1.5 }}>
                To send an automatic report through the Telegram bot, follow these steps:
              </Typography>
              {[
                <>Enter <span style={{ color: "var(--primary)" }}>@getidsbot</span> on Telegram.</>,
                <>Copy the ID.</>,
                <>Place the ID in the input named "Telegram for Report".</>,
                <>Click the "Save" button.</>,
                <>Click start to modme bot ( <span style={{ color: "var(--primary)" }}>@modme_robot</span> ).</>,
              ].map((step, i) => (
                <Typography key={i} sx={{ fontSize: 13, color: "var(--text)", mb: 0.8 }}>
                  {i + 1}. {step}
                </Typography>
              ))}
            </Box>
          </Box>
        </FieldCard>

      </Box>

      {/* ── Social Media ── */}
      <FieldCard title="Social Media" sx={{ maxWidth: 760, mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 0.5 }}>
          <Box>
            <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.8 }}>
              Facebook pixel
            </Typography>
            <TextField
              fullWidth size="small" value={facebookPixel}
              onChange={(e) => setFacebookPixel(e.target.value)}
              sx={{ background: "var(--surface)", "& .MuiOutlinedInput-root": { fontSize: 13 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, color: "var(--text)", mb: 0.8 }}>
              Telegram
            </Typography>
            <TextField
              fullWidth size="small" value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              sx={{ background: "var(--surface)", "& .MuiOutlinedInput-root": { fontSize: 13 } }}
            />
          </Box>
        </Box>
      </FieldCard>

      {/* ── Save ── */}
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
  );
};

export default Integrations;