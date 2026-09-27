import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { actions, useSystemStatus } from "../store/status.tsx";

export const ThemeToggle = () => {
  const { theme } = useSystemStatus();
  const isDark = theme === "dark";
  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        aria-label="toggle dark light theme"
        color="inherit"
        onClick={() => actions.setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};