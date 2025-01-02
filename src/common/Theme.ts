import { ThemeOptions, createTheme } from "@mui/material";

const defaultTheme: ThemeOptions = {
  palette: {
    mode: "dark",
  },
};

const lightTheme: ThemeOptions = {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: "black",
          backgroundColor: "#fff",
          "& h1": {
            color: "black",
          },
        },
        textArea: {
          color: "black",
        },
      },
    },
  },
  palette: {
    mode: "light",
  },
};

const poleTheme: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#6BAA52",
    },
    secondary: {
      main: "#EEEEEE",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: "black",
          background: "linear-gradient(45deg,#8baa8980,#fff 44%)",
          "& h1": {
            color: "black",
          },
        },
        textArea: {
          color: "black",
        },
      },
    },
  },
};

const themeMap = {
  light: lightTheme,
  dark: defaultTheme,
  pole: poleTheme,
};

export const theme = (key: keyof typeof themeMap) =>
  createTheme(themeMap[key] ?? themeMap.dark);
