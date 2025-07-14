







import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import { addWord, lookupWord } from "./server/words.js";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

const getLanguages = (langs) => {
  if (!langs) {
    return [];
  }
  try {
    return JSON.parse(langs);
  } catch (e) {
    console.error("[ENV: LANGUAGES]", e.message);
    return [];
  }
};

const DEV = process.env.DEV;
const LANGUAGE_TOOL = process.env.LANGUAGETOOL_URL;
const LIBRETRANSLATE = process.env.LIBRETRANSLATE_URL;
const OLLAMA = process.env.OLLAMA;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;
const THEME = process.env.THEME;
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY;
const LIBRETRANSLATE_LANGUAGES = getLanguages(
  process.env.LIBRETRANSLATE_LANGUAGES
);
const LANGUAGE_TOOL_LANGUAGES = getLanguages(
  process.env.LANGUAGE_TOOL_LANGUAGES
);
const DISABLE_DICTIONARY = process.env.DISABLE_DICTIONARY === 'true';

const maskString = (str) => {
  if (!str || str.length <= 3) {
    return str;
  }
  const visibleChars = str.substring(0, 3);
  const stars = "*".repeat(str.length - 3);
  return visibleChars + stars;
};

console.log(`
==== services setup ====
LANGUAGE_TOOL: ${LANGUAGE_TOOL}
LIBRETRANSLATE: ${LIBRETRANSLATE}
OLLAMA: ${OLLAMA}
OLLAMA_MODEL: ${OLLAMA_MODEL}
THEME: ${THEME}
API_KEY: ${maskString(LIBRETRANSLATE_API_KEY)} // masked
LANGUAGE_TOOL_LANGUAGES: ${JSON.stringify(LANGUAGE_TOOL_LANGUAGES)}
LIBRETRANSLATE_LANGUAGES: ${JSON.stringify(LIBRETRANSLATE_LANGUAGES)}
DICTIONARY_DISABLED: ${!!DISABLE_DICTIONARY}
DEV_MODE: ${!!DEV}
========================
`);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import and use translation routes
import translationRoutes from './server/translations/translationRoutes.js';
app.use('/api/translations', translationRoutes);

const handleProxyGET = (url, res, filter) => {
  fetch(url)
    .then((data) => data.json())
    .then((data) => res.send(filter ? filter(data) : data))
    .catch((error) => res.send(error));
};

const handleProxyPost = (url, req, res) => {
  fetch(url, {
    method: "POST",
    body: JSON.stringify(req.body),
    headers: { "Content-Type": "application/json" },
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      console.log({ error, url });
      res.send(error);
    });
};

const handleFormDataPost = (url, req, res, filter) => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  const formData = new URLSearchParams();
  const keys = Object.keys(req.body);
  keys.forEach((key) => {
    formData.append(key, req.body[key]);
  });
  return fetch(url, {
    method: "POST",
    headers: headers,
    body: formData.toString(),
  })
    .then((data) => data.json())
    .then((data) => {
      res.send(filter ? filter(data) : data);
    })
    .catch((error) => {
      console.log({ error: error.message, url });
      res.send(error);
    });
};

app.get("/api/status", (req, res) => {
  res.send({
    LANGUAGE_TOOL,
    LIBRETRANSLATE,
    OLLAMA,
    OLLAMA_MODEL,
    THEME,
    DISABLE_DICTIONARY
  });
});

app.get("/api/libretranslate/languages", (req, res) => {
  const filter = (data) => {
    if (LIBRETRANSLATE_LANGUAGES.length === 0) {
      return data;
    }
    return data.filter((item) => LIBRETRANSLATE_LANGUAGES.includes(item.code));
  };
  handleProxyGET(`${LIBRETRANSLATE}/languages`, res, filter);
});

app.post("/api/libretranslate/translate", (req, res) => {
  handleProxyPost(
    `${LIBRETRANSLATE}/translate`,
    { ...req, body: { ...req.body, api_key: LIBRETRANSLATE_API_KEY ?? "" } },
    res
  );
});

app.post("/api/ollama/generate", (req, res) => {
  handleProxyPost(
    `${OLLAMA}/api/generate`,
    { ...req, body: { ...req.body, model: OLLAMA_MODEL } },
    res
  );
});

app.post("/api/languagetool/check", (req, res) => {
  const filter = (result) => {
    const filtered = {
      ...result,
      matches: result.matches
        .map((match) => {
          if (match.rule.category.id === "TYPOS") {
            const exists = lookupWord(
              match.context.text.substr(
                match.context.offset,
                match.context.length
              )
            );
            if (exists) {
              return false;
            } else {
              return match;
            }
          }
        })
        .filter((elem) => elem),
    };
    return filtered;
  };

  const targetFilter = DISABLE_DICTIONARY ? filter : false;
  handleFormDataPost(`${LANGUAGE_TOOL}/v2/check`, req, res, targetFilter);
});

app.post("/api/languagetool/add", (req, res) => {
  if (DISABLE_DICTIONARY) {
    res.status(403).send();
    return;
  }
  try {
    addWord(`${req.body.word}`.toLowerCase());
    console.log("added:", `${req.body.word}`.toLowerCase());
    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

app.get("/api/languagetool/languages", (req, res) => {
  const filter = (data) => {
    if (LANGUAGE_TOOL_LANGUAGES.length === 0) {
      return data;
    }
    return data.filter((item) =>
      LANGUAGE_TOOL_LANGUAGES.includes(item.longCode)
    );
  };
  handleProxyGET(`${LANGUAGE_TOOL}/v2/languages`, res, filter);
});

if (DEV) {
  // Proxy requests to the Vite development server
  app.use(
    "/",
    createProxyMiddleware({
      target: "http://localhost:3000", // The port on which Vite is running
      changeOrigin: true,
      secure: false,
      onError(err, req, res) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(
          "Something went wrong. And we are reporting a custom error message."
        );
      },
    })
  );
}

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "dist")));

// Handle any requests that don't match the ones above by sending them the index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});







