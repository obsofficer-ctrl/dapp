import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import path from 'path';

const DEFAULT_LANGUAGE = 'de';

/**
 * Reads an email template file for the given language.
 * Falls back to the default language template if the requested language is not available.
 *
 * @param {string} templateName - The base name of the template file (without language suffix)
 * @param {string} language - The language code (e.g., 'en', 'fr', 'de')
 * @returns {string} The template content
 */
export const readEmailTemplate = (templateName, language) => {
  const templateDir = path.join(process.env.PWD || '', 'private', 'email-templates');
  
  const requestedLangFile = path.join(templateDir, `${templateName}.${language}.html`);
  const defaultLangFile = path.join(templateDir, `${templateName}.${DEFAULT_LANGUAGE}.html`);
  const fallbackFile = path.join(templateDir, `${templateName}.html`);

  // Try requested language first
  if (language && language !== DEFAULT_LANGUAGE) {
    try {
      if (fs.existsSync(requestedLangFile)) {
        console.log(`Reading email template for language: ${language}`);
        return fs.readFileSync(requestedLangFile, 'utf8');
      } else {
        console.log(`Template for language '${language}' not found, falling back to default.`);
      }
    } catch (e) {
      console.log(`Error reading template for language '${language}': ${e.message}`);
    }
  }

  // Try default language file
  try {
    if (fs.existsSync(defaultLangFile)) {
      console.log(`Reading default language (${DEFAULT_LANGUAGE}) email template.`);
      return fs.readFileSync(defaultLangFile, 'utf8');
    }
  } catch (e) {
    console.log(`Error reading default language template: ${e.message}`);
  }

  // Final fallback to template without language suffix
  try {
    if (fs.existsSync(fallbackFile)) {
      console.log(`Reading fallback email template (no language suffix).`);
      return fs.readFileSync(fallbackFile, 'utf8');
    }
  } catch (e) {
    console.log(`Error reading fallback template: ${e.message}`);
  }

  throw new Meteor.Error('template-not-found', `Email template '${templateName}' not found.`);
};

/**
 * Replaces placeholders in a template string with provided data.
 *
 * @param {string} template - The template string with placeholders like {{key}}
 * @param {object} data - Key-value pairs for placeholder replacement
 * @returns {string} The template with replaced placeholders
 */
export const renderTemplate = (template, data) => {
  let rendered = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, data[key] || '');
  });
  return rendered;
};

/**
 * Sends a DOI confirmation request email.
 *
 * @param {object} params - Email parameters
 * @param {string} params.recipient - The recipient's email address
 * @param {string} params.sender - The sender's email address
 * @param {string} params.confirmationUrl - The confirmation URL
 * @param {string} params.senderName - The sender's name
 * @param {string} params.language - The language code for the email template (optional)
 */
export const sendConfirmationRequest = (params) => {
  const {
    recipient,
    sender,
    confirmationUrl,
    senderName,
    language = DEFAULT_LANGUAGE
  } = params;

  const templateName = 'doi-email';
  const templateContent = readEmailTemplate(templateName, language);
  
  const emailBody = renderTemplate(templateContent, {
    confirmationUrl,
    senderName,
    recipient,
    sender
  });

  const subjectTemplate = readEmailTemplate(`${templateName}-subject`, language);
  const subject = renderTemplate(subjectTemplate, {
    senderName,
    recipient,
    sender
  }).trim();

  Email.send({
    to: recipient,
    from: sender,
    subject: subject,
    html: emailBody
  });

  console.log(`DOI confirmation email sent to ${recipient} in language: ${language}`);
};
