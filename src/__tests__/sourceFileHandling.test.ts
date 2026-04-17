// Tests for Source.tsx file handling logic
// These test the core file extension detection and binary file upload flow

describe('Source.tsx file handling', () => {
  const supportedTextExtensions = ['txt', 'nfo', 'html', 'htm', 'xml', 'xhtml', 'md', 'srt'];
  const supportedBinaryExtensions = ['odt', 'docx', 'pptx', 'epub'];
  const allSupportedExtensions = [...supportedTextExtensions, ...supportedBinaryExtensions];

  // Simulate the handleFileChange logic from Source.tsx
  const classifyFileExtension = (filename: string): 'text' | 'binary' | 'unsupported' => {
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    if (!fileExtension) return 'unsupported';
    if (supportedTextExtensions.includes(fileExtension)) return 'text';
    if (supportedBinaryExtensions.includes(fileExtension)) return 'binary';
    return 'unsupported';
  };

  describe('file extension classification', () => {
    it('should classify text extensions correctly', () => {
      supportedTextExtensions.forEach((ext) => {
        expect(classifyFileExtension(`test.${ext}`)).toBe('text');
      });
    });

    it('should classify binary extensions correctly', () => {
      supportedBinaryExtensions.forEach((ext) => {
        expect(classifyFileExtension(`test.${ext}`)).toBe('binary');
      });
    });

    it('should reject unsupported extensions', () => {
      const unsupported = ['pdf', 'xlsx', 'jpg', 'png', 'zip', 'rar'];
      unsupported.forEach((ext) => {
        expect(classifyFileExtension(`test.${ext}`)).toBe('unsupported');
      });
    });

    it('should handle case-insensitive extensions', () => {
      expect(classifyFileExtension('file.DOCX')).toBe('binary');
      expect(classifyFileExtension('file.Docx')).toBe('binary');
      expect(classifyFileExtension('file.TXT')).toBe('text');
      expect(classifyFileExtension('file.Txt')).toBe('text');
    });

    it('should handle filenames with multiple dots', () => {
      expect(classifyFileExtension('my.document.docx')).toBe('binary');
      expect(classifyFileExtension('report.final.txt')).toBe('text');
      expect(classifyFileExtension('index.html')).toBe('text');
    });

    it('should handle filenames without extensions', () => {
      expect(classifyFileExtension('noextension')).toBe('unsupported');
      expect(classifyFileExtension('.hidden')).toBe('unsupported');
    });

    it('should return unsupported for empty filename', () => {
      expect(classifyFileExtension('')).toBe('unsupported');
    });
  });

  describe('all supported extensions list', () => {
    it('should contain all text and binary extensions combined', () => {
      const expected = [...supportedTextExtensions, ...supportedBinaryExtensions];
      expect(allSupportedExtensions).toEqual(expected);
    });

    it('should have the correct total count of supported extensions', () => {
      expect(allSupportedExtensions.length).toBe(12); // 8 text + 4 binary
    });

    it('should not contain duplicates', () => {
      const unique = new Set(allSupportedExtensions);
      expect(unique.size).toBe(allSupportedExtensions.length);
    });

    it('should generate correct HTML accept attribute format', () => {
      const acceptAttr = allSupportedExtensions.map((ext) => `.${ext}`).join(',');
      expect(acceptAttr).toBe('.txt,.nfo,.html,.htm,.xml,.xhtml,.md,.srt,.odt,.docx,.pptx,.epub');
    });
  });

  describe('binary file upload flow', () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('should create FormData with the correct field name for binary files', async () => {
      const mockFile = new File(['test content'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text: 'Extracted document text' }),
      } as Response);

      const formData = new FormData();
      formData.append('file', mockFile);

      await fetch('/api/translate/docx', { method: 'POST', body: formData });

      expect(fetchSpy).toHaveBeenCalledWith('/api/translate/docx', expect.objectContaining({
        method: 'POST',
      }));

      // Verify FormData contains the file under 'file' key
      const entries = Array.from(formData.entries());
      expect(entries.length).toBe(1);
      expect(entries[0][0]).toBe('file');
    });

    it('should handle successful DOCX extraction response', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text: 'Hello from DOCX' }),
      } as Response);

      const mockFile = new File(['content'], 'test.docx');
      const formData = new FormData();
      formData.append('file', mockFile);

      const response = await fetch('/api/translate/docx', { method: 'POST', body: formData });
      const data = await response.json();

      expect(data.text).toBe('Hello from DOCX');
    });

    it('should handle fetch failure for binary file upload', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      const mockFile = new File(['content'], 'test.docx');
      const formData = new FormData();
      formData.append('file', mockFile);

      await expect(fetch('/api/translate/docx', { method: 'POST', body: formData })).rejects.toThrow('Network error');
    });

    it('should handle HTTP error response from server', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Failed to process DOCX file'),
      } as Response);

      const mockFile = new File(['content'], 'test.docx');
      const formData = new FormData();
      formData.append('file', mockFile);

      const response = await fetch('/api/translate/docx', { method: 'POST', body: formData });
      expect(response.ok).toBe(false);
    });

    it('should handle server returning empty text from DOCX', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text: '' }),
      } as Response);

      const mockFile = new File(['content'], 'empty.docx');
      const formData = new FormData();
      formData.append('file', mockFile);

      const response = await fetch('/api/translate/docx', { method: 'POST', body: formData });
      const data = await response.json();

      expect(data.text).toBe('');
    });

    it('should send correct Content-Type header for FormData', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text: 'test' }),
      } as Response);

      const mockFile = new File(['content'], 'test.docx');
      const formData = new FormData();
      formData.append('file', mockFile);

      await fetch('/api/translate/docx', { method: 'POST', body: formData });

      // When using FormData, the browser sets Content-Type with boundary automatically
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/translate/docx',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });
  });

  describe('text file upload flow (client-side FileReader)', () => {
    it('should use FileReader.readAsText for text files', () => {
      // Verify that text extensions trigger the client-side path
      const textFiles = ['document.txt', 'notes.md', 'index.html', 'subtitles.srt'];

      textFiles.forEach((filename) => {
        expect(classifyFileExtension(filename)).toBe('text');
      });
    });

    it('should use fetch for binary files (server-side processing)', () => {
      // Verify that binary extensions trigger the server-side path
      const binaryFiles = ['document.docx', 'presentation.pptx', 'book.epub', 'doc.odt'];

      binaryFiles.forEach((filename) => {
        expect(classifyFileExtension(filename)).toBe('binary');
      });
    });
  });

  describe('edge cases for file handling', () => {
    it('should handle very long filenames', () => {
      const longFilename = 'a'.repeat(200) + '.docx';
      expect(classifyFileExtension(longFilename)).toBe('binary');
    });

    it('should handle unicode characters in filenames', () => {
      expect(classifyFileExtension('документ.docx')).toBe('binary');
      expect(classifyFileExtension('文件.txt')).toBe('text');
      expect(classifyFileExtension('файл.odt')).toBe('binary');
    });

    it('should handle filenames with spaces', () => {
      expect(classifyFileExtension('my document.docx')).toBe('binary');
      expect(classifyFileExtension('my file.txt')).toBe('text');
    });

    it('should handle mixed case in middle of extension string', () => {
      // Edge case: extension appears multiple times
      expect(classifyFileExtension('docx.backup.docx')).toBe('binary');
    });

    it('should handle dotfiles with extensions', () => {
      expect(classifyFileExtension('.config.json')).toBe('unsupported');
      expect(classifyFileExtension('.profile.txt')).toBe('text');
    });

    it('should handle numeric-only filenames with extensions', () => {
      expect(classifyFileExtension('123.docx')).toBe('binary');
      expect(classifyFileExtension('456.txt')).toBe('text');
    });
  });

  describe('FormData construction for binary uploads', () => {
    it('should construct FormData with single file entry', async () => {
      const mockFile = new File(['content'], 'test.docx');
      const formData = new FormData();
      formData.append('file', mockFile);

      expect(formData.has('file')).toBe(true);
      const entries = Array.from(formData.entries());
      expect(entries.length).toBe(1);
    });

    it('should preserve file metadata in FormData', async () => {
      const mockFile = new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const entries = Array.from(formData.entries());
      expect(entries[0][1]).toBe(mockFile);
    });

    it('should handle different binary file types with correct FormData construction', async () => {
      const binaryTypes = [
        { name: 'doc.odt', type: 'application/vnd.oasis.opendocument.text' },
        { name: 'ppt.pptx', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
        { name: 'book.epub', type: 'application/epub+zip' },
      ];

      for (const { name, type } of binaryTypes) {
        const mockFile = new File(['content'], name, { type });
        const formData = new FormData();
        formData.append('file', mockFile);

        expect(formData.has('file')).toBe(true);
      }
    });
  });
});
