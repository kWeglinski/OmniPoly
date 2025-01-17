const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 80;

const LANGUAGE_TOOL = process.env.LANGUAGE_TOOL;
const LIBRETRANSLATE = process.env.LIBRETRANSLATE;
const OLLAMA = process.env.OLLAMA;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

console.log(`
==== services setup ====
LANGUAGE_TOOL: ${LANGUAGE_TOOL}
LIBRETRANSLATE: ${LIBRETRANSLATE}
OLLAMA: ${OLLAMA}
OLLAMA_MODEL: ${OLLAMA_MODEL}
========================
`);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const handleProxyGET = (url, res) => {
  fetch(url)
    .then((data) => data.json())
    .then((data) => res.send(data))
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
  });
});

app.get("/api/libretranslate/languages", (req, res) => {
  handleProxyGET(`${LIBRETRANSLATE}/languages`, res);
});

app.post("/api/libretranslate/translate", (req, res) => {
  handleProxyPost(`${LIBRETRANSLATE}/translate`, req, res);
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
  handleProxyGET(`${LANGUAGE_TOOL}/v2/languages`, res);
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
