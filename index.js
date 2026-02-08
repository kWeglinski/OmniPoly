// eslint-disable-next-line no-undef
/* global process */
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import { addWord } from "./server/words.js";
import { filterResult } from "./server/filterHelper.js";

const dirname = new URL(".", import.meta.url).pathname;

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
const LANGUAGE_TOOL = process.env.LANGUAGE_TOOL;
const LANGUAGE_TOOL_PICKY = process.env.LANGUAGE_TOOL_PICKY;
const LIBRETRANSLATE = process.env.LIBRETRANSLATE;
const OLLAMA = process.env.OLLAMA;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;
const THEME = process.env.THEME;
const HARPER = process.env.HARPER;
const DEBUG = process.env.DEBUG;
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY;
const LIBRETRANSLATE_LANGUAGES = getLanguages(
  process.env.LIBRETRANSLATE_LANGUAGES
);
const LANGUAGE_TOOL_LANGUAGES = getLanguages(
  process.env.LANGUAGE_TOOL_LANGUAGES
);
const DISABLE_DICTIONARY = process.env.DISABLE_DICTIONARY === "true";

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
DEBUG_MODE: ${!!DEBUG} 
========================
`);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const handleProxyGET = (url, res, filter) => {
  if (DEBUG) {
    console.log(`Calling: ${url}`);
  }
  fetch(url)
    .then((data) => data.json())
    .then((data) => {
      if (DEBUG) {
        console.log(data);
      }
      return res.send(filter ? filter(data) : data);
    })
    .catch((error) => {
      console.error("[PROXY GET ERROR]", error);
      res.status(500).send("Internal server error");
    });
};

const handleProxyPost = (url, req, res) => {
  if (DEBUG) {
    console.log(`Calling: ${url}`);
  }
  fetch(url, {
    method: "POST",
    body: JSON.stringify(req.body),
    headers: { "Content-Type": "application/json" },
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      if (DEBUG) {
        console.log(data);
      }
      res.send(data);
    })
    .catch((error) => {
      console.log({ error, url });
      res.status(500).send("Internal server error");
    });
};

const handleFormDataPost = (url, req, res, filter, additionalData) => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  const formData = new URLSearchParams();
  const keys = Object.keys(req.body);
  keys.forEach((key) => {
    formData.append(key, req.body[key]);
  });
  if (additionalData) {
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });
  }
  if (DEBUG) {
    console.log(`Calling: ${url}`);
    console.log({ formData });
  }
  return fetch(url, {
    method: "POST",
    headers: headers,
    body: formData.toString(),
  })
    .then((data) => data.json())
    .then((data) => {
      if (DEBUG) {
        console.log(data);
      }
      res.send(filter ? filter(data) : data);
    })
    .catch((error) => {
      console.log({ error: error.message, url });
      res.status(500).send("Internal server error");
    });
};

app.get("/api/status", (req, res) => {
  const HARPER_ENABLED = HARPER && HARPER.toLowerCase() === 'true';
  
  res.send({
    LANGUAGE_TOOL,
    LIBRETRANSLATE,
    OLLAMA,
    OLLAMA_MODEL,
    THEME,
    HARPER: HARPER_ENABLED,
    DISABLE_DICTIONARY: !!DISABLE_DICTIONARY,
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

app.post("/api/languagetool/check", async (req, res) => {
  // If dictionary is disabled, use a filter that keeps all matches (no dictionary filtering)
  const filter = DISABLE_DICTIONARY ? (data) => data : (data) => filterResult(data, true);

  handleFormDataPost(
    `${LANGUAGE_TOOL}/v2/check`,
    req,
    res,
    filter,
    LANGUAGE_TOOL_PICKY
      ? {
          level: "picky",
        }
      : {}
  );
});

app.post("/api/languagetool/add", (req, res) => {
  if (DISABLE_DICTIONARY) {
    res.status(403).send();
    return;
  }
  
  // Validate input
  const word = req.body.word;
  if (typeof word !== "string" || word.length === 0 || word.length > 50) {
    res.status(400).send("Invalid word");
    return;
  }
  
  try {
    addWord(word.toLowerCase());
    console.log("added:", word.toLowerCase());
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

// Harper endpoints
app.post("/api/harper/check", async (req, res) => {
  if (!HARPER || HARPER.toLowerCase() !== 'true') {
    res.status(503).send("Harper is not enabled");
    return;
  }

  try {
    const harper = await import('harper.js');
    
    // Determine dialect based on language code
    const langCode = req.body.language || 'en-US';
    let dialect;
    
    if (langCode.includes('en-GB') || langCode === 'en-UK') {
      dialect = harper.Dialect.British;
    } else if (langCode.includes('en-CA')) {
      dialect = harper.Dialect.Canadian;
    } else if (langCode.includes('en-AU')) {
      dialect = harper.Dialect.Australian;
    } else {
      dialect = harper.Dialect.American;
    }

    const linter = new harper.LocalLinter({
      binary: harper.binary,
      dialect: dialect,
    });

    const text = req.body.text;
    const lints = await linter.lint(text);

    // Convert Harper format to match LanguageTool response format
      const matches = lints.map((lint) => {
        // Get the lint category/kind for the rule ID
        const lintKind = lint.lint_kind_pretty() || 'unknown';
        
        return {
          message: lint.message(),
          shortMessage: lint.message().split(':')[0] || lint.message(),
          replacements: Array.from({ length: lint.suggestion_count() }, (_, i) => ({
            value: lint.suggestions()[i]?.get_replacement_text() || '',
          })),
          offset: lint.span().start,
          length: lint.span().end - lint.span().start,
          context: {
            text: text.substring(
              Math.max(0, lint.span().start - 50),
              Math.min(text.length, lint.span().end + 50)
            ),
            offset: 50,
            length: lint.span().end - lint.span().start,
          },
          sentence: text,
          rule: {
            id: `harper_${lintKind.replace(/\s+/g, '_')}`,
            subId: '',
            sourceFile: '',
            description: lint.message(),
            issueType: 'grammar',
            category: {
              id: 'harper',
              name: 'Harper Grammar Check',
            },
          },
          type: {
            typeName: 'Grammar',
          },
        };
      });

    res.send({
      software: {
        name: 'Harper',
        version: '1.6.0',
        buildDate: new Date().toISOString(),
        apiVersion: 1,
        premium: false,
        premiumHint: '',
        status: 'ok',
      },
      warnings: {},
      language: {
        name: langCode.includes('en-GB') ? 'English (UK)' : 
               langCode.includes('en-CA') ? 'English (CA)' :
               langCode.includes('en-AU') ? 'English (AU)' : 'English (US)',
        code: langCode,
        detectedLanguages: [{ language: langCode, rate: 1.0 }],
      },
      matches: matches,
      sentenceRanges: [[0, text.length]],
      extendedSentenceRanges: [{
        from: 0,
        to: text.length,
        detectedLanguages: [{ language: langCode, rate: 1.0 }],
      }],
    });
  } catch (error) {
    console.error("[HARPER ERROR]", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/api/harper/languages", (req, res) => {
  if (!HARPER || HARPER.toLowerCase() !== 'true') {
    res.status(503).send("Harper is not enabled");
    return;
  }

  // Harper supports these dialects
  const languages = [
    { name: 'English (US)', code: 'en-US', longCode: 'en-US' },
    { name: 'English (UK)', code: 'en-GB', longCode: 'en-GB' },
    { name: 'English (CA)', code: 'en-CA', longCode: 'en-CA' },
    { name: 'English (AU)', code: 'en-AU', longCode: 'en-AU' },
  ];

  res.json(languages);
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
app.use(express.static(path.join(dirname, "dist")));

// Handle any requests that don't match the ones above by sending them the index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
