import { Snackbar } from "@mui/material";
import { create } from "zustand";

export const InitialiseSnackbar = () => {
  const { open, duration, message } = useSnackBar();
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={() => actions.setOpen(false)}
      message={message}
    />
  );
};

export type SnackBar = {
  open: boolean;
  duration: number;
  message: string;
};

export const useSnackBar = create<SnackBar>(() => ({
  open: false,
  duration: 2000,
  message: "",
}));

export const actions = {
  setOpen: (value: SnackBar["open"]) => {
    useSnackBar.setState({ open: value });
  },
  showSnack: (value: SnackBar["message"]) => {
    useSnackBar.setState({ open: true, message: value });
  },
};
