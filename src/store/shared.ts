import { create } from "zustand";

type SharedState = {
  question: string;
};

export const useShared = create<SharedState>(() => ({
  question: localStorage.getItem("question") ?? "",
}));

export const setQuestion = (q: string) => {
  localStorage.setItem("question", q);
  useShared.setState({ question: q });
};
