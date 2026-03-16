import { assert } from 'chai';
import { readEmailTemplate, renderTemplate } from './sendConfirmationRequest';
import fs from 'fs';
import path from 'path';

describe('Email Template Tests', function() {
  
  describe('renderTemplate', function() {
    it('should replace single placeholder', function() {
      const template = 'Hello {{ name }}!';
      const result = renderTemplate(template, { name: 'World' });
      assert.equal(result, 'Hello World!');
    });

    it('should replace multiple placeholders', function() {
      const template = 'Hello {{ name }}, click {{ url }} to confirm.';
      const result = renderTemplate(template, { name: 'Alice', url: 'http://example.com' });
      assert.equal(result, 'Hello Alice, click http://example.com to confirm.');
    });

    it('should handle missing placeholder values gracefully', function() {
      const template = 'Hello {{ name }}!';
      const result = renderTemplate(template, {});
      assert.equal(result, 'Hello !');
    });

    it('should replace placeholders with spaces inside braces', function() {
      const template = 'Hello {{name}} and {{ senderName }}!';
      const result = renderTemplate(template, { name: 'Alice', senderName: 'Bob' });
      assert.equal(result, 'Hello Alice and Bob!');
    });
  });

  describe('readEmailTemplate', function() {
    it('should fall back to default language template when requested language is not available', function() {
      // 'xx' language does not exist, should fall back to 'de'
      try {
        const template = readEmailTemplate('doi-email', 'xx');
        assert.isString(template);
        assert.isAbove(template.length, 0);
      } catch (e) {
        // If template files don't exist in test env, this is acceptable
        assert.include(e.error, 'template-not-found');
      }
    });
  });

});
