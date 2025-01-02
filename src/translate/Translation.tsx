import { Chip, IconButton } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { useState } from "react";
import { TranslationResponse } from "./types";

export const Translation = ({ answer }: { answer: TranslationResponse }) => {
  const [choice, setChoice] = useState(0);

  const getChoice = (
    translation: TranslationResponse,
    choice: number
  ): string => {
    if (!translation || !translation.translatedText) {
      return "";
    }
    if (choice === 0) {
      return translation.translatedText;
    }
    return translation.alternatives[choice];
  };

  const max = answer?.alternatives?.length;
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  const translated = getChoice(answer, choice);

  return (
    <>
      {translated && (
        <IconButton
          sx={{ position: "absolute", right: 0 }}
          size="small"
          onClick={() => {
            copyToClipboard(translated);
          }}
        >
          {/* @ts-expect-error: fontSize exists and works */}
          <ContentCopyRoundedIcon fontSize="10" />
        </IconButton>
      )}
      <p className="translated-text">{translated}</p>
      {answer?.alternatives?.length > 0 && (
        <>
          <IconButton onClick={() => choice > 0 && setChoice(choice - 1)}>
            <ArrowLeftIcon />
          </IconButton>
          <Chip label={`${choice + 1} / ${max}`} />
          <IconButton onClick={() => choice < max - 1 && setChoice(choice + 1)}>
            <ArrowRightIcon />
          </IconButton>
        </>
      )}
    </>
  );
};
