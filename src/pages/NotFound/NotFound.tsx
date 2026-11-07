import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export const NotFound = () => (
  <Box sx={{ p: 8, textAlign: "center" }}>
    <Typography sx={{ fontSize: 72, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>404</Typography>
    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Sahifa topilmadi</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      Siz izlayotgan sahifa mavjud emas yoki ko'chirilgan.
    </Typography>
    <Button component={Link} to="/dashboard" variant="contained">
      Dashboardga qaytish
    </Button>
  </Box>
);
