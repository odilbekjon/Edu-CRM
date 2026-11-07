import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../Header/Header";
import { useSidebar } from "../../Context/SidebarContext";
import { Sidebar, SIDEBAR_WIDTH, SUBMENU_WIDTH, HEADER_HEIGHT } from "../Sidebar/Sidebar";

/**
 * Asosiy qobiq (header + sidebar). Router'da bir marta o'rnatiladi, sahifalar <Outlet /> ichida almashadi —
 * shuning uchun sidebar/header sahifa o'zgarganda qayta yuklanmaydi.
 */
export const Layout = () => {
  const { openSubmenu } = useSidebar();
  const { pathname } = useLocation();

  const contentLeft = SIDEBAR_WIDTH + (openSubmenu ? SUBMENU_WIDTH : 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            marginLeft: `${contentLeft}px`,
            marginTop: `${HEADER_HEIGHT}px`,
            flex: 1,
            minWidth: 0,
            overflowY: "auto",
            transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            backgroundColor: "var(--bg)",
          }}
        >
          <div key={pathname} className="page-in">
            <Outlet />
          </div>
        </Box>
      </Box>
    </Box>
  );
};
