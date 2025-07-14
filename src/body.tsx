



import "./index.css";
import { Switcher } from "./switcher";
import { theme } from "./common/Theme";
import { CssBaseline, ThemeProvider, AppBar, Toolbar, Box } from "@mui/material";
import { Footer } from "./common/Footer";
import { useInitialiseSystemStatus, useSystemStatus } from "./store/status";
import { InitialiseSnackbar } from "./store/snack";
import { LanguageSwitcher } from "./common/LanguageSwitcher";

export const Body = () => {
  useInitialiseSystemStatus();
  const { theme: themeOption } = useSystemStatus();

  return (
    <ThemeProvider theme={theme(themeOption)}>
      <InitialiseSnackbar />
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <LanguageSwitcher />
          </Box>
        </Toolbar>
      </AppBar>
      <div className="layout">
        <Switcher />
        <Footer />
      </div>
    </ThemeProvider>
  );
};



