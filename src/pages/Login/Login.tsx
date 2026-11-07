import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { FiEye, FiEyeOff, FiLock, FiPhone } from "react-icons/fi";
import logo from "../../assets/logo_ya.png";
import blackLogo from "../../assets/logo_ya_black.png";
import cover from "../../assets/login.png";
import { useAuth } from "../../Context/AuthContext";
import { LangMenu, ThemeToggle } from "../../components/PreferenceToggles";
import { errorMessage } from "../../api";

const FEATURES = [
  "O'quvchilar, guruhlar va o'qituvchilarni bir joyda boshqaring",
  "To'lovlar, qarzdorlar va xarajatlar hisobi",
  "Davomat, eslatmalar va lead'lar nazorati",
];

const DEFAULT_PHONE = "91 517 97 74";
const DEFAULT_PASSWORD = "1111";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Standart (demo) kirish ma'lumotlari — maydonlar oldindan to'ldirilgan
  const [phone, setPhone] = useState(DEFAULT_PHONE);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password) {
      setError("Telefon raqam va parolni kiriting.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "var(--bg)" }}>
      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: "1 1 52%",
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          p: 7,
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1b2a6b 55%, var(--primary) 100%)",
        }}
      >
        <Box
          component="img"
          src={cover}
          alt=""
          aria-hidden
          sx={{
            position: "absolute", right: -60, bottom: -40, height: "88%", opacity: 0.22,
            maskImage: "linear-gradient(to left, #000 40%, transparent)",
            WebkitMaskImage: "linear-gradient(to left, #000 40%, transparent)",
            pointerEvents: "none",
          }}
        />
        <Box component="img" src={logo} alt="Young Adults" sx={{ width: 190, position: "relative" }} />

        <Box sx={{ position: "relative", maxWidth: 480 }}>
          <Typography sx={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", mb: 2.5 }}>
            O'quv markazingizni
            <br />
            oson boshqaring
          </Typography>
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 1.5 }}>
            {FEATURES.map((f) => (
              <Box component="li" key={f} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", opacity: 0.92 }}>
                <Box sx={{ mt: "7px", width: 8, height: 8, borderRadius: "50%", bgcolor: "#f4c020", flexShrink: 0 }} />
                <Typography sx={{ fontSize: 15 }}>{f}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography sx={{ position: "relative", fontSize: 13, opacity: 0.6 }}>
          © {new Date().getFullYear()} Young Adults LLC — Always step ahead!
        </Typography>
      </Box>

      {/* Form panel */}
      <Box sx={{ flex: "1 1 48%", display: "grid", placeItems: "center", p: { xs: 2.5, sm: 5 }, position: "relative" }}>
        <Box sx={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 1 }}>
          <LangMenu />
          <ThemeToggle />
        </Box>
        <Box
          component="form"
          onSubmit={handleLogin}
          noValidate
          sx={{
            width: "100%", maxWidth: 420, bgcolor: "var(--surface)", borderRadius: "20px", p: { xs: 3, sm: 4.5 },
            boxShadow: "0 20px 50px rgba(16,24,40,.08)", border: "1px solid var(--border)",
          }}
        >
          <Box component="img" src={blackLogo} alt="Young Adults" sx={{ width: 120, mb: 3, display: { md: "none" } }} />
          <Typography sx={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Xush kelibsiz 👋</Typography>
          <Typography sx={{ color: "var(--muted)", mt: 0.5, mb: 3, fontSize: 14.5 }}>
            Davom etish uchun hisobingizga kiring
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Telefon raqam"
            autoComplete="username"
            autoFocus
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="90 123 45 67"
            inputProps={{ maxLength: 13, inputMode: "tel" }}
            sx={{ mb: 2.2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiPhone size={17} color="var(--muted)" />
                  <Box sx={{ ml: 1, pr: 1.2, borderRight: "1px solid var(--border)", fontSize: 14, fontWeight: 600 }}>+998</Box>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Parol"
            autoComplete="current-password"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiLock size={17} color="var(--muted)" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPass((p) => !p)} edge="end" aria-label="Parolni ko'rsatish">
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ py: 1.4, fontSize: 15, borderRadius: "12px" }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Kirish"}
          </Button>

          <Typography sx={{ mt: 2.5, textAlign: "center", fontSize: 12.5, color: "var(--muted)" }}>
            Demo kirish: <b>{DEFAULT_PHONE}</b> / <b>{DEFAULT_PASSWORD}</b>
          </Typography>

          <Typography sx={{ mt: 1.5, textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            Markazingiz uchun CRM kerakmi?{" "}
            <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
              Ariza qoldiring
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
