import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Translate from "./translate/App.tsx";
import LangCheck from "./languagecheck/App.tsx";

interface CustomTabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
  [key: string]: unknown;
}

function CustomTabPanel(props: CustomTabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const hasLangTool = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const languageCheckerUrl = urlParams.get("ltapi");

  const baseUrl =
    //@ts-expect-error: window
    languageCheckerUrl ?? window._lturl;

  return baseUrl !== "%LTAPI%";
};

const hasLibreTanslate = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const libreUrl = urlParams.get("api");

  //@ts-expect-error: window
  const baseUrl = libreUrl ?? window._libreurl;

  return baseUrl !== "%API%";
};

export const Switcher = () => {
  const initTab = parseInt(localStorage.getItem("tab") ?? "0");
  const [tab, setTab] = useState(initTab);
  const tabSetter = (val: number) => {
    setTab(val);
    localStorage.setItem("tab", val.toString());
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          centered
          value={tab}
          onChange={(_, val) => tabSetter(val)}
          aria-label="basic tabs example"
        >
          {hasLibreTanslate() && <Tab label="Translate" {...a11yProps(0)} />}
          {hasLangTool() && <Tab label="Language Check" {...a11yProps(1)} />}
        </Tabs>
      </Box>
      <CustomTabPanel value={tab} index={0}>
        <Translate />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={1}>
        <LangCheck />
      </CustomTabPanel>
    </>
  );
};
