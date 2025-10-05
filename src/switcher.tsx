import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Translate from "./translate/App.tsx";
import LangCheck from "./languagecheck/App.tsx";
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
};

const getInitTab = (
  browserTab: number,
  tools: Record<string, boolean>
) => {
  const tool = ToolMap[browserTab];
  if (!tool || !tools[tool]) {
    const newTarget = tools.libreTranslate ? 0 : 1;
    localStorage.setItem("tab", newTarget.toString());
    return newTarget;
  }
  return browserTab;
};

export const Switcher = () => {
  const { libreTranslate, languageTool } = useSystemStatus();
  const browserTab = parseInt(localStorage.getItem("tab") ?? "-1");
  const initTab = getInitTab(browserTab, { libreTranslate, languageTool });

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
