

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const SERVER_SCRIPT = path.resolve(process.cwd(), 'index.js');
const PORT = 9998;

let serverProcess;

beforeAll((done) => {
  process.env.LANGUAGE_TOOL = 'http://localhost:8001';
  process.env.LIBRETRANSLATE = 'http://localhost:8002';
  process.env.LIBRETRANSLATE_API_KEY = 'test-api-key';
  process.env.OLLAMA = 'http://localhost:8003';
  process.env.OLLAMA_MODEL = 'test-model';
  process.env.THEME = 'dark';
  process.env.HARPER = 'false';
  process.env.DEBUG = 'false';
  process.env.DISABLE_DICTIONARY = 'true';
  process.env.DEFAULT_TAB = 'translate';
  process.env.DEFAULT_TARGET_LANGUAGE = 'es';

  serverProcess = spawn('node', [SERVER_SCRIPT], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (data) => {
    if (data.toString().includes('Server is running on port')) {
      done();
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[server] ${data}`);
  });
}, 15000);

afterAll((done) => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    setTimeout(done, 500);
  } else {
    done();
  }
});

function httpGet(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${PORT}${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
  });
}

function httpPost(urlPath, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

describe('Server Integration Tests', () => {
  describe('GET /api/status', () => {
    it('should return server status with all service configurations', async () => {
      const res = await httpGet('/api/status');

      expect(res.status).toBe(200);
      const data = JSON.parse(res.body);

      expect(data).toHaveProperty('LANGUAGE_TOOL');
      expect(data).toHaveProperty('LIBRETRANSLATE');
      expect(data).toHaveProperty('OLLAMA');
      expect(data.OLLAMA_MODEL).toBe('test-model');
      expect(data.THEME).toBe('dark');
      expect(data.HARPER).toBe(false);
      expect(data.DISABLE_DICTIONARY).toBe(true);
      expect(data.DEFAULT_TAB).toBe('translate');
      expect(data.DEFAULT_TARGET_LANGUAGE).toBe('es');
    });
  });

  describe('POST /api/libretranslate/translate', () => {
    it('should proxy translation request to LibreTranslate service (connection refused)', async () => {
      const res = await httpPost('/api/libretranslate/translate', {
        q: 'Hello world',
        source: 'en',
        target: 'es',
        format: 'text',
        alternatives: 3,
        api_key: '',
      });

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/languagetool/add', () => {
    it('should return 403 when dictionary is disabled for all inputs', async () => {
      const res = await httpPost('/api/languagetool/add', { word: 'testword' });

      expect(res.status).toBe(403);
    });

    it('should return 403 even for invalid word when dictionary is disabled', async () => {
      const res = await httpPost('/api/languagetool/add', { word: '' });

      expect(res.status).toBe(403);
    });

    it('should return 403 for non-string word when dictionary is disabled', async () => {
      const res = await httpPost('/api/languagetool/add', { word: 12345 });

      expect(res.status).toBe(403);
    });

    it('should return 403 for word exceeding max length when dictionary is disabled', async () => {
      const longWord = 'a'.repeat(51);
      const res = await httpPost('/api/languagetool/add', { word: longWord });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/harper/check', () => {
    it('should return 503 when Harper is disabled', async () => {
      const res = await httpPost('/api/harper/check', { text: 'Hello world', language: 'en-US' });

      expect(res.status).toBe(503);
    });
  });

  describe('GET /api/harper/languages', () => {
    it('should return 503 when Harper is disabled', async () => {
      const res = await httpGet('/api/harper/languages');

      expect(res.status).toBe(503);
    });
  });
});
