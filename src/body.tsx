import "./index.css";
import { Switcher } from "./switcher";
import { theme } from "./common/Theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Footer } from "./common/Footer";
import { useInitialiseSystemStatus, useSystemStatus } from "./store/status";
import { InitialiseSnackbar } from "./store/snack";

export const Body = () => {
  useInitialiseSystemStatus();
  const { theme: themeOption } = useSystemStatus();

  return (
    <ThemeProvider theme={theme(themeOption)}>
      <InitialiseSnackbar />
      <CssBaseline />
      <div className="layout">
        <Switcher />
        <Footer />
      </div>
    </ThemeProvider>
  );
};
