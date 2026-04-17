import { Button, Chip, IconButton, Tooltip, useTheme } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import styled from "styled-components";
import { Lang, TranslationResponse } from "./types";
import { actions } from "../store/translate";
import { actions as snackActions } from "../store/snack";

const IconContainer = styled.div`
  position: absolute;
  top: -10px;
  right: 0px;
  z-index: 1;
`;

const supportedTextExtensions = ['txt', 'nfo', 'html', 'htm', 'xml', 'xhtml', 'md', 'srt'];
const supportedBinaryExtensions = ['odt', 'docx', 'pptx', 'epub'];
const allSupportedExtensions = [...supportedTextExtensions, ...supportedBinaryExtensions];

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event?.target?.files && event.target.files[0];
  if (file) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isTextFormat = supportedTextExtensions.includes(fileExtension || '');
    const isBinaryFormat = supportedBinaryExtensions.includes(fileExtension || '');

    if (isTextFormat) {
      const reader = new FileReader();
      reader.onload = (e) => {
        //@ts-expect-error: result exists
        actions.setQuestion(e.target.result);
        snackActions.showSnack("File successfully read");
      };
      reader.readAsText(file);
    } else if (isBinaryFormat) {
      const formData = new FormData();
      formData.append("file", file);

      snackActions.showSnack("Processing document...");
      fetch("/api/translate/docx", { method: "POST", body: formData })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to process file");
          return response.json();
        })
        .then((data) => {
          actions.setQuestion(data.text);
          snackActions.showSnack("File successfully read");
        })
        .catch(() => {
          snackActions.showSnack("Failed to read file");
        });
    } else {
      snackActions.showSnack("Unsupported file format");
    }
  }
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const Source = ({
  question,
  setQuestion,
  answer,
  languages,
}: {
  question: string;
  setQuestion: (q: string) => void;
  answer: TranslationResponse;
  languages: Lang[];
}) => {
  const hasDl = answer.detectedLanguage;
  const dl =
    languages &&
    hasDl &&
    languages.find(
      (lang: Lang) => lang.code === answer?.detectedLanguage?.language
    );
  const theme = useTheme();
  console.log({ theme });
  return (
    <>
      <div className="autosize" data-replicated-value={question}>
        <IconContainer>
          <Tooltip
            title={
              <span style={{ textAlign: "center" }}>
                Upload file. <br /> supported file types:
                {allSupportedExtensions.map(ext => `.${ext}`).join(', ')}
              </span>
            }
          >
            <Button
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              size="small"
            >
              <FileUploadOutlinedIcon fontSize="inherit" />
              <VisuallyHiddenInput
                type="file"
                accept={allSupportedExtensions.map(ext => `.${ext}`).join(',')}
                onChange={handleFileChange}
                multiple={false}
              />
            </Button>
          </Tooltip>

          <Tooltip title="Clear text">
            <IconButton
              onClick={() => setQuestion("")}
              aria-label="copy"
              size="small"
            >
              <ClearRoundedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </IconContainer>
        <textarea
          placeholder="Your text here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ color: theme.palette.text.primary }}
        >
          {question}
        </textarea>
      </div>
      {hasDl && dl && <Chip label={`detected: ${dl.name}`} />}
    </>
  );
};
