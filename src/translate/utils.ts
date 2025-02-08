import { Lang, LangChoice } from "./types";

export const justLangData = ({ name, code, targets }: LangChoice): Lang => ({
  name,
  code,
  targets,
});

export const AUTOMATIC: Lang = { name: "automatic", code: "auto", targets: [] };

export const moveToTop = (array: unknown[], value: unknown) => {
  const filteredArray = array.filter((item) => item !== value);
  filteredArray.unshift(value);
  return filteredArray;
};

export const getFromLS = (key: string) => {
  const ls = localStorage.getItem(key);
  if (ls) {
    return JSON.parse(ls);
  }
  return "";
};
