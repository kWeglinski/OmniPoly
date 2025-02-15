import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DownloadForOfflineOutlinedIcon from "@mui/icons-material/DownloadForOfflineOutlined";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { useState } from "react";
import { TranslationResponse } from "./types";
import { copyToClipboard } from "../common/utils";

const ShowFullCutoff = 100;

function downloadTextAsFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const getAlternativesLength = (
  alternatives: TranslationResponse["alternatives"]
) => {
  if (!alternatives || alternatives.length === 0) {
    return 0;
  }
  const asLengths = alternatives.map((alt) => alt.length);
  return Math.max(...asLengths);
};

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
  const translated = getChoice(answer, choice);
  const hasAlternatives = answer?.alternatives?.length > 0;
  const hasNotableWords = answer.notableWords && answer.notableWords.length > 0;
  const alternativesMaxLength = getAlternativesLength(answer?.alternatives);

  return (
    <>
      {translated && (
        <Stack direction="row" sx={{ position: "absolute", right: 0, top: '-10px' }}>
          <Tooltip title="Download as file">
            <IconButton
              size="small"
              onClick={() => {
                downloadTextAsFile(translated, "translation.txt");
              }}
            >
              <DownloadForOfflineOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy to clipboard">
            <IconButton
              size="small"
              onClick={() => {
                copyToClipboard(translated);
              }}
            >
              <ContentCopyRoundedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
      <p className="translated-text">{translated}</p>
      {hasNotableWords &&
        answer.notableWords?.map((word) => (
          <p className="translated-text">
            {word.word} - {word.explanation}
          </p>
        ))}
      {hasAlternatives && alternativesMaxLength < ShowFullCutoff && (
        <Stack direction="row" gap={1} flexWrap={"wrap"}>
          {answer.alternatives.map((alternative, index) => (
            <Chip
              label={alternative}
              onClick={() => {
                setChoice(index);
              }}
              variant={"outlined"}
            />
          ))}
        </Stack>
      )}
      {hasAlternatives && alternativesMaxLength >= ShowFullCutoff && (
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
