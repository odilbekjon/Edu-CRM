import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  ListItemButton,
  Button,
} from "@mui/material";
import { MdNotifications } from "react-icons/md";
import { notificationsApi, errorMessage, type ApiNotification } from "../../api";
import { useToast } from "../../Context/ToastContext";

export const Notifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .list()
      .then(setNotifications)
      .catch((e) => toast(errorMessage(e), "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const markAllRead = async () => {
    try {
      await notificationsApi.readAll();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: 28 }}>
          Notifications
        </Typography>
        {hasUnread && (
          <Button variant="outlined" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </Box>

      {!loading && notifications.length === 0 && (
        <Typography color="text.secondary">Hozircha xabarlar yo'q.</Typography>
      )}

      <List>
        {notifications.map((n) => (
          <React.Fragment key={n.id}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                sx={{ backgroundColor: n.read ? "var(--surface)" : "var(--primary-tint)", borderRadius: 2 }}
              >
                <ListItemIcon>
                  <MdNotifications color="var(--primary)" size={24} />
                </ListItemIcon>
                <ListItemText
                  primary={n.text}
                  secondary={new Date(n.createdAt).toLocaleString("uz-UZ")}
                />
                {!n.read && <Badge color="primary" variant="dot" />}
              </ListItemButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};
