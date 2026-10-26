import * as chai from 'chai';
import { describe, it } from 'mocha';
import { sanitizeExternalUrl, isPlaceholderHost } from '../util/chatbotLinks.js';
import { normalizeChatInput, MAX_CHAT_INPUT_LENGTH } from '../util/chatbotInput.js';

const expect = chai.expect;

// These tests are pure: no DB, no OpenAI call, so they cost nothing to run.
describe('chatbotLinks (unit, no server/DB/LLM required)', () => {
  describe('sanitizeExternalUrl', () => {
    it('keeps real http(s) URLs', () => {
      expect(sanitizeExternalUrl('https://tickets.example-real.com/qf')).to.equal(
        'https://tickets.example-real.com/qf'
      );
      expect(sanitizeExternalUrl('http://ventas.mievento.com.ar/entradas')).to.equal(
        'http://ventas.mievento.com.ar/entradas'
      );
    });

    it('rejects the placeholder links seeded for demos', () => {
      expect(sanitizeExternalUrl('https://entradas.demo/qf')).to.equal(null);
      expect(sanitizeExternalUrl('https://foo.test/bar')).to.equal(null);
      expect(sanitizeExternalUrl('https://foo.invalid/bar')).to.equal(null);
      expect(sanitizeExternalUrl('https://example.com/bar')).to.equal(null);
      expect(sanitizeExternalUrl('http://localhost:3000/x')).to.equal(null);
    });

    it('rejects non-http protocols', () => {
      expect(sanitizeExternalUrl('javascript:alert(1)')).to.equal(null);
      expect(sanitizeExternalUrl('ftp://files.com/x')).to.equal(null);
      expect(sanitizeExternalUrl('data:text/html,<h1>x</h1>')).to.equal(null);
    });

    it('rejects empty, malformed and non-string values', () => {
      for (const v of [undefined, null, '', '   ', 'no-es-una-url', 42, {}, []]) {
        expect(sanitizeExternalUrl(v), String(v)).to.equal(null);
      }
    });
  });

  describe('isPlaceholderHost', () => {
    it('flags reserved TLDs and known placeholder hosts', () => {
      expect(isPlaceholderHost('entradas.demo')).to.equal(true);
      expect(isPlaceholderHost('example.com')).to.equal(true);
      expect(isPlaceholderHost('sub.example.org')).to.equal(true);
      expect(isPlaceholderHost('')).to.equal(true);
    });

    it('does not flag real hosts', () => {
      expect(isPlaceholderHost('railway.app')).to.equal(false);
      expect(isPlaceholderHost('quickfood.com.ar')).to.equal(false);
    });
  });
});

describe('chatbotInput (unit, no server/DB/LLM required)', () => {
  describe('normalizeChatInput', () => {
    it('trims and collapses whitespace', () => {
      expect(normalizeChatInput('  hola   mundo  ')).to.equal('hola mundo');
      expect(normalizeChatInput('linea1\nlinea2')).to.equal('linea1 linea2');
    });

    it('keeps characters that used to break the request (& and +)', () => {
      expect(normalizeChatInput('musica & comida')).to.equal('musica & comida');
      expect(normalizeChatInput('2+2')).to.equal('2+2');
    });

    it('strips control characters', () => {
      expect(normalizeChatInput('hola\u0000mundo')).to.equal('hola mundo');
    });

    it('caps the length', () => {
      const long = 'a'.repeat(MAX_CHAT_INPUT_LENGTH + 200);
      expect(normalizeChatInput(long)).to.have.lengthOf(MAX_CHAT_INPUT_LENGTH);
    });

    it('returns an empty string for non-strings and blanks', () => {
      for (const v of [undefined, null, '', '   ', 42, {}, []]) {
        expect(normalizeChatInput(v), String(v)).to.equal('');
      }
    });
  });
});
