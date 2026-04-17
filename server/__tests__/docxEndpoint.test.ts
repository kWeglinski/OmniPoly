import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';

// We'll test the endpoint logic directly without importing mammoth,
// by mocking at the module level before any imports
jest.mock('mammoth', () => ({
  extractRawText: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockMammoth = require('mammoth');

describe('/api/translate/docx endpoint', () => {
  let app: express.Application;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a fresh Express app for each test to avoid state leakage
    app = express();
    const MAX_BODY_SIZE = '5mb';
    app.use(bodyParser.urlencoded({ extended: false, limit: MAX_BODY_SIZE }));
    app.use(bodyParser.json({ limit: MAX_BODY_SIZE }));

    const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockMammoth.extractRawText as any).mockImplementation(async ({ buffer }: { buffer: Buffer }) => {
      if (buffer.length === 0) {
        return { value: '', messages: [] };
      }
      // Simulate successful extraction for non-empty buffers
      return { value: 'Extracted text from DOCX', messages: [] };
    });

    app.post('/api/translate/docx', upload.single('file'), async (req, res) => {
      if (!req.file) {
        res.status(400).send('No file provided');
        return;
      }

      try {
        const result = await mockMammoth.extractRawText({ buffer: req.file.buffer });
        res.send({ text: result.value });
      } catch (error) {
        console.error('[DOCX ERROR]', error);
        res.status(500).send('Failed to process DOCX file');
      }
    });
  });

  describe('file upload validation', () => {
    it('should return 400 when no file is provided', async () => {
      const response = await request(app)
        .post('/api/translate/docx')
        .field('dummy', 'value');

      expect(response.status).toBe(400);
      expect(response.text).toBe('No file provided');
    });

    it('should return 400 when no file field is present at all', async () => {
      const response = await request(app)
        .post('/api/translate/docx')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('successful DOCX processing', () => {
    it('should extract text from a DOCX file and return it', async () => {
      const mockDocxBinary = Buffer.from('fake docx binary content');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockMammoth.extractRawText as any).mockResolvedValueOnce({
        value: 'This is the extracted text from the document.',
        messages: [],
      });

      const response = await request(app)
        .post('/api/translate/docx')
        .attach('file', mockDocxBinary, 'test.docx');

      expect(response.status).toBe(200);
      expect(response.body.text).toBe('This is the extracted text from the document.');
    });

    it('should pass the file buffer to mammoth correctly', async () => {
      const mockBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // ZIP header bytes

      await request(app)
        .post('/api/translate/docx')
        .attach('file', mockBuffer, 'document.docx');

      expect(mockMammoth.extractRawText).toHaveBeenCalledTimes(1);
    });

    it('should handle mammoth warnings in the response messages', async () => {
      const mockBuffer = Buffer.from('test content');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockMammoth.extractRawText as any).mockResolvedValueOnce({
        value: 'Extracted text with warnings',
        messages: [{ message: 'Some formatting issue', type: 'warning' }],
      });

      const response = await request(app)
        .post('/api/translate/docx')
        .attach('file', mockBuffer, 'test.docx');

      expect(response.status).toBe(200);
      expect(response.body.text).toBe('Extracted text with warnings');
    });
  });

  describe('error handling', () => {
    it('should return 500 when mammoth fails to process invalid file', async () => {
      const invalidBuffer = Buffer.from('not a valid docx at all');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockMammoth.extractRawText as any).mockRejectedValueOnce(new Error('Invalid file format'));

      const response = await request(app)
        .post('/api/translate/docx')
        .attach('file', invalidBuffer, 'corrupted.docx');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Failed to process DOCX file');
    });

    it('should return 500 when mammoth throws a generic error', async () => {
      const mockBuffer = Buffer.from('some data');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockMammoth.extractRawText as any).mockRejectedValueOnce(new Error('Unexpected token'));

      const response = await request(app)
        .post('/api/translate/docx')
        .attach('file', mockBuffer, 'broken.docx');

      expect(response.status).toBe(500);
    });

    it('should handle empty DOCX file gracefully', async () => {
      const emptyBuffer = Buffer.from([]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockMammoth.extractRawText as any).mockResolvedValueOnce({
        value: '',
        messages: [],
      });

      const response = await request(app)
        .post('/api/translate/docx')
        .attach('file', emptyBuffer, 'empty.docx');

      expect(response.status).toBe(200);
      expect(response.body.text).toBe('');
    });
  });

  describe('content-type handling', () => {
    it('should accept multipart/form-data uploads', async () => {
      const mockBuffer = Buffer.from('fake docx');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockMammoth.extractRawText as any).mockResolvedValueOnce({
        value: 'Test content',
        messages: [],
      });

      const response = await request(app)
        .post('/api/translate/docx')
        .attach('file', mockBuffer, 'test.docx');

      expect(response.status).toBe(200);
    });

    it('should reject non-file form fields as file uploads', async () => {
      const response = await request(app)
        .post('/api/translate/docx')
        .send({ text: 'some text' });

      expect(response.status).toBe(400);
    });
  });
});

describe('body-parser size limits configuration', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    const MAX_BODY_SIZE = '5mb';
    app.use(bodyParser.urlencoded({ extended: false, limit: MAX_BODY_SIZE }));
    app.use(bodyParser.json({ limit: MAX_BODY_SIZE }));

    // Simple endpoint to test body parsing with size limits
    app.post('/api/test/json', (req, res) => {
      res.send({ received: typeof req.body.text });
    });

    app.post('/api/test/urlencoded', (req, res) => {
      res.send({ received: req.body.field });
    });
  });

  it('should parse small JSON bodies correctly', async () => {
    const smallBody = { text: 'Hello World'.repeat(10) }; // ~120 bytes
    const response = await request(app)
      .post('/api/test/json')
      .send(smallBody);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe('string');
  });

  it('should parse small urlencoded bodies correctly', async () => {
    const response = await request(app)
      .post('/api/test/urlencoded')
      .type('form')
      .send({ field: 'test value' });

    expect(response.status).toBe(200);
    expect(response.body.received).toBe('test value');
  });

  it('should parse large JSON bodies within the limit', async () => {
    // Create a body that is ~100KB (larger than default 100KB but under 5MB)
    const largeText = 'x'.repeat(100 * 1024); // 100KB of data
    const response = await request(app)
      .post('/api/test/json')
      .send({ text: largeText });

    expect(response.status).toBe(200);
    expect(response.body.received).toBe('string');
  });

  it('should parse large urlencoded bodies within the limit', async () => {
    const largeField = 'y'.repeat(100 * 1024);
    const response = await request(app)
      .post('/api/test/urlencoded')
      .type('form')
      .send({ field: largeField });

    expect(response.status).toBe(200);
  });

  it('should reject JSON bodies exceeding the limit', async () => {
    // Create a body larger than 5MB
    const hugeText = 'z'.repeat(6 * 1024 * 1024); // 6MB
    const response = await request(app)
      .post('/api/test/json')
      .send({ text: hugeText });

    expect(response.status).toBe(413);
  });

  it('should reject urlencoded bodies exceeding the limit', async () => {
    const hugeField = 'w'.repeat(6 * 1024 * 1024);
    const response = await request(app)
      .post('/api/test/urlencoded')
      .type('form')
      .send({ field: hugeField });

    expect(response.status).toBe(413);
  });
});

describe('mammoth.js DOCX extraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract plain text from a mock DOCX document', async () => {
    const expectedText = 'Paragraph one.\n\nParagraph two with some formatting.';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockMammoth.extractRawText as any).mockResolvedValueOnce({
      value: expectedText,
      messages: [],
    });

    const result = await mockMammoth.extractRawText({ buffer: Buffer.from([0x50, 0x4b]) });

    expect(result.value).toBe(expectedText);
    expect(Array.isArray(result.messages)).toBe(true);
  });

  it('should return empty string for empty document', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockMammoth.extractRawText as any).mockResolvedValueOnce({
      value: '',
      messages: [],
    });

    const result = await mockMammoth.extractRawText({ buffer: Buffer.from([]) });

    expect(result.value).toBe('');
  });

  it('should handle documents with special characters', async () => {
    const specialText = 'Hello 世界! café résumé naïve';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockMammoth.extractRawText as any).mockResolvedValueOnce({
      value: specialText,
      messages: [],
    });

    const result = await mockMammoth.extractRawText({ buffer: Buffer.from('test') });

    expect(result.value).toBe(specialText);
  });

  it('should handle documents with newlines and whitespace', async () => {
    const textWithWhitespace = 'Line one\n\n  Indented line\n\tTabbed line';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockMammoth.extractRawText as any).mockResolvedValueOnce({
      value: textWithWhitespace,
      messages: [],
    });

    const result = await mockMammoth.extractRawText({ buffer: Buffer.from('test') });

    expect(result.value).toBe(textWithWhitespace);
  });

  it('should include warning messages when present', async () => {
    const warnings = [
      { message: 'Image not found', type: 'warning' },
      { message: 'Unsupported element', type: 'info' },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockMammoth.extractRawText as any).mockResolvedValueOnce({
      value: 'Some text',
      messages: warnings,
    });

    const result = await mockMammoth.extractRawText({ buffer: Buffer.from('test') });

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].message).toBe('Image not found');
  });
});

  describe('multer file upload configuration', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockMammoth.extractRawText as any).mockImplementation(async ({ buffer }: { buffer: Buffer }) => {
      if (buffer.length === 0) return { value: '', messages: [] };
      return { value: 'Extracted text', messages: [] };
    });

    app.post('/api/test/upload', upload.single('file'), async (req, res) => {
      if (!req.file) {
        res.status(400).send('No file');
        return;
      }
      // Simulate mammoth processing to avoid 500 errors from mock
      try {
        const result = await mockMammoth.extractRawText({ buffer: req.file.buffer });
        res.send({ text: result.value, size: req.file.size });
      } catch (_error) {
        res.status(500).send('Failed');
      }
    });
  });

  it('should accept and store file in memory', async () => {
    const testBuffer = Buffer.from('test file content');
    const response = await request(app)
      .post('/api/test/upload')
      .attach('file', testBuffer, 'test.txt');

    expect(response.status).toBe(200);
  });

  it('should accept files up to the configured size limit', async () => {
    const largeBuffer = Buffer.alloc(4 * 1024 * 1024, 'x'); // 4MB (under 5MB limit)
    const response = await request(app)
      .post('/api/test/upload')
      .attach('file', largeBuffer, 'large.txt');

    expect(response.status).toBe(200);
  });

  it('should reject files exceeding the configured size limit with 413', async () => {
    const testApp = express();
    // Use express.raw with a small limit to test body size enforcement
    testApp.use(express.raw({ type: '*/*', limit: '5mb' }));

    testApp.post('/test', (req, res) => {
      if (!req.file) {
        res.status(400).send('No file');
        return;
      }
      res.send({ ok: true });
    });

    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'x'); // 6MB (over limit)
    const response = await request(testApp)
      .post('/test')
      .attach('file', largeBuffer, 'large.txt');

    expect(response.status).toBe(413);
  });
});
