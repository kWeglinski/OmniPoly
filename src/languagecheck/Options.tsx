import {
  Chip,
  Divider,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from "@mui/material";
import { actions } from "../store/grammar";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import { Match } from "./API";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "transparent",
  },
}));

type OptionsProps = {
  replacements: { value: string }[];
  isSelected: boolean;
  text: string;
  index: number;
  context: Match;
};

export const Options = ({
  replacements,
  isSelected,
  text,
  index,
  context,
}: OptionsProps) => {
  const handleFixPos = (value: string) => {
    actions.fixPos(value, index);
  };

  return (
    <HtmlTooltip
      sx={{ background: "transparent" }}
      title={
        <div>
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography variant="h6" component="div">
                {context.shortMessage}
              </Typography>
              <Typography variant="body2">{context.message}</Typography>
            </CardContent>
            <Divider />
            <CardActions>
              {replacements.slice(0, 4).map((elem) => (
                <Chip
                  key={elem.value}
                  onClick={() => handleFixPos(elem.value)}
                  label={elem.value}
                />
              ))}
            </CardActions>
          </Card>
        </div>
      }
    >
      <span
        style={{
          position: "relative",
          background: isSelected ? "rgba(255,0,0,0.3)" : "transparent",
          borderBottom: isSelected ? "none" : "2px solid rgba(255,0,0,0.5)",
          color: "#fff",
          left: 0,
          top: 0,
          borderRadius: isSelected ? "4px" : 0,
          cursor: "pointer",
        }}
        onClick={() => actions.setSelection(0)}
      >
        {text}
      </span>
    </HtmlTooltip>
  );
};
