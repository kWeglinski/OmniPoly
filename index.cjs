const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

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

const LANGUAGE_TOOL = process.env.LANGUAGE_TOOL;
const LIBRETRANSLATE = process.env.LIBRETRANSLATE;
const OLLAMA = process.env.OLLAMA;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;
const THEME = process.env.THEME;
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY;
const LIBRETRANSLATE_LANGUAGES = getLanguages(process.env.LIBRETRANSLATE_LANGUAGES);
const LANGUAGE_TOOL_LANGUAGES = getLanguages(process.env.LANGUAGE_TOOL_LANGUAGES);



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
========================
`);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

const handleFormDataPost = (url, req, res) => {
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
      res.send(data);
    })
    .catch((error) => {
      console.log({ error, url });
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
  handleFormDataPost(`${LANGUAGE_TOOL}/v2/check`, req, res);
});

app.get("/api/languagetool/languages", (req, res) => {
  const filter = (data) => {
    if (LANGUAGE_TOOL_LANGUAGES.length === 0) {
      return data;
    }
    return data.filter((item) => LANGUAGE_TOOL_LANGUAGES.includes(item.longCode));
  };
  handleProxyGET(`${LANGUAGE_TOOL}/v2/languages`, res, filter);
});

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "dist")));

// Handle any requests that don't match the ones above by sending them the index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
