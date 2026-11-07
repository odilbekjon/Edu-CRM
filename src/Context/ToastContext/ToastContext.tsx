import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";

type Severity = "success" | "error" | "info" | "warning";

interface ToastContextValue {
  toast: (message: string, severity?: Severity) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{ message: string; severity: Severity; key: number } | null>(null);

  const toast = useCallback((message: string, severity: Severity = "info") => {
    setState({ message, severity, key: Date.now() });
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={state?.key}
        open={!!state}
        autoHideDuration={4000}
        onClose={(_, reason) => reason !== "clickaway" && setState(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {state ? (
          <Alert severity={state.severity} variant="filled" onClose={() => setState(null)} sx={{ borderRadius: 3, fontWeight: 500 }}>
            {state.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
