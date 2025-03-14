import { Divider, Link, Stack } from "@mui/material";
import { useWindowSize } from "./useWindowSize";

export const Footer = () => {
  const [windowWidth] = useWindowSize();
  const showDivider = windowWidth > 800;
  return (
    <footer>
      <div style={{ padding: "5px 25px" }}>
        <Stack
          direction={windowWidth > 800 ? "row" : "column"}
          gap={windowWidth > 800 ? 1 : 0}
        >
          <p>{`made with ❤`}</p>
          {showDivider && <Divider orientation="vertical" flexItem />}
          <p>
            {`frontend by: `}
            <Link
              href="https://github.com/kWeglinski"
              target="_blank"
              rel="noopener noreferrer"
            >
              kWeglinski
            </Link>
          </p>
          {showDivider && <Divider orientation="vertical" flexItem />}
          <p>
            {`Translate API by: `}
            <Link
              href="https://github.com/LibreTranslate/LibreTranslate/graphs/contributors"
              rel="noopener noreferrer"
              target="_blank"
            >
              LibreTranslate Contributors
            </Link>{" "}
          </p>
          {showDivider && <Divider orientation="vertical" flexItem />}
          <p>
            {`powered by: `}
            <Link
              href="https://github.com/argosopentech/argos-translate/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Argos Translate
            </Link>
          </p>
        </Stack>
        <Stack sx={{ paddingTop: '10px', justifyContent: "center", alignItems: "center" }}>
          <img
            src="/favicon/apple-touch-icon.png"
            alt="logo"
            width="25px"
            style={{ margin: "auto" }}
          />
        </Stack>
      </div>
    </footer>
  );
};
