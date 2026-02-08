import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Translate from "./translate/App.tsx";
import LangCheck from "./languagecheck/App.tsx";
import HarperCheck from "./harper/App.tsx";
import { useSystemStatus } from "./store/status.tsx";

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

const ToolMap: { [key: number]: string } = {
  0: "libreTranslate",
  1: "languageTool",
  2: "harper",
};

const getInitTab = (
  browserTab: number,
  tools: Record<string, boolean>
) => {
  const tool = ToolMap[browserTab];
  // If tab is out of range or tool is not available, find first available
  if (browserTab < 0 || browserTab > 2 || !tool || !tools[tool]) {
    // Find first available tool in order: libreTranslate, languageTool, harper
    if (tools.libreTranslate) {
      localStorage.setItem("tab", "0");
      return 0;
    } else if (tools.languageTool) {
      localStorage.setItem("tab", "1");
      return 1;
    } else if (tools.harper) {
      localStorage.setItem("tab", "2");
      return 2;
    }
    // Fallback to 0 if no tools available
    localStorage.setItem("tab", "0");
    return 0;
  }
  return browserTab;
};

export const Switcher = () => {
  const { libreTranslate, languageTool, harper } = useSystemStatus();
  const browserTab = parseInt(localStorage.getItem("tab") ?? "-1");
  const initTab = getInitTab(browserTab, { libreTranslate, languageTool, harper });

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
          {libreTranslate && (
            <Tab value={0} label="Translate" {...a11yProps(0)} />
          )}
          {languageTool && (
            <Tab value={1} label="Language Check" {...a11yProps(1)} />
          )}
          {harper && (
            <Tab value={2} label="Harper Check" {...a11yProps(2)} />
          )}
        </Tabs>
      </Box>
      <CustomTabPanel value={tab} index={0}>
        <Translate />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={1}>
        <LangCheck />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={2}>
        <HarperCheck />
      </CustomTabPanel>
    </>
  );
};
