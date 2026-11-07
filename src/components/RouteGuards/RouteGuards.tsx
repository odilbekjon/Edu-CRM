import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../../Context/AuthContext";
import type { Role } from "../../api";

const FullScreenSpinner = () => (
  <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "var(--bg)" }}>
    <CircularProgress />
  </Box>
);

/** Tizimga kirmagan foydalanuvchini login sahifasiga yo'naltiradi */
export const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />;
  return <Outlet />;
};

/** Kirgan foydalanuvchini login sahifasidan dashboardga o'tkazadi */
export const PublicOnly = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

/** Faqat berilgan rollar kira oladi */
export const RequireRole = ({ roles }: { roles: Role[] }) => {
  const { user } = useAuth();
  if (!user) return null;
  if (!roles.includes(user.role)) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Ruxsat yo'q</Typography>
        <Typography color="text.secondary">Bu bo'limga kirish uchun sizning rolingizda huquq yo'q.</Typography>
      </Box>
    );
  }
  return <Outlet />;
};
