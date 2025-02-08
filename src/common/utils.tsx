import { actions as snackActions } from "../store/snack";

export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      snackActions.showSnack('Text copied to clipboard')
    })
  };