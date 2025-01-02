import { Lang, LangChoice } from "./types";

export const justLangData = ({ name, code, targets }: LangChoice): Lang => ({
  name,
  code,
  targets,
});

export const withHistory =
  (key: string, setter: React.Dispatch<React.SetStateAction<unknown>>) =>
  (value: Lang) => {
    if (!value) {
      return;
    }
    setter((store: LangChoice) => {
      const isAuto = value.code === AUTOMATIC.code;
      const history = isAuto
        ? (store?.history || []).slice(0, 3)
        : moveToTop(store?.history ?? [], value);

      const newValue = {
        ...value,
        history,
      };

      localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  };

export const AUTOMATIC: Lang = { name: "automatic", code: "auto", targets: [] };

const moveToTop = (array: unknown[], value: unknown) => {
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
