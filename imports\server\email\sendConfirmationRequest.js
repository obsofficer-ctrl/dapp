import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import path from 'path';
import { validateLanguage, DEFAULT_LANGUAGE } from '../../both/startup/index';

/**
 * Resolves the path to the private assets directory.
 * In Meteor, private files are stored in the `private` folder
 * and accessible via Assets.getText() or the filesystem.
 */
const getTemplateDir = () => {
  // Meteor assets path
  if (typeof Assets !== 'undefined') {
    return null; // Will use Assets.getText() instead
  }
  return path.join(process.env.PWD || process.cwd(), 'private', 'email-templates');
};

/**
 * Reads a template file using Meteor's Assets API if available,
 * otherwise falls back to filesystem access.
 *
 * @param {string} templateName - The base name of the template
 * @param {string} language - The language code
 * @returns {string|null} The template content or null if not found
 */
const tryReadTemplate = (templateName, language) => {
  const fileName = `email-templates/${templateName}.${language}.html`;
  
  try {
    // Use Meteor Assets API (reads from /private directory)
    if (typeof Assets !== 'undefined') {
      return Assets.getText(fileName);
    }
    
    // Fallback to filesystem for testing environments
    const templateDir = path.join(process.env.PWD || process.cwd(), 'private');
    const filePath = path.join(templateDir, fileName);
    
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (e) {
    // Template not found for this language
    console.log(`Template '${fileName}' not found: ${e.message}`);
  }
  
  return null;
};

/**
 * Reads an email template file for the given language.
 * Falls back to the default language template if the requested language is not available.
 *
 * @param {string} templateName - The base name of the template file (without language suffix)
 * @param {string} language - The language code (e.g., 'en', 'fr', 'de')
 * @returns {string} The template content
 */
export const readEmailTemplate = (templateName, language) => {
  const normalizedLanguage = validateLanguage(language);
  
  // Try requested language first (if different from default)
  if (normalizedLanguage !== DEFAULT_LANGUAGE) {
    const content = tryReadTemplate(templateName, normalizedLanguage);
    if (content !== null) {
      console.log(`Loaded email template '${templateName}' for language: ${normalizedLanguage}`);
      return content;
    }
    console.log(`Template for language '${normalizedLanguage}' not found, falling back to '${DEFAULT_LANGUAGE}'.`);
  }

  // Try default language
  const defaultContent = tryReadTemplate(templateName, DEFAULT_LANGUAGE);
  if (defaultContent !== null) {
    console.log(`Loaded default email template '${templateName}' (${DEFAULT_LANGUAGE}).`);
    return defaultContent;
  }

  throw new Meteor.Error('template-not-found', `Email template '${templateName}' could not be found for language '${language}' or default '${DEFAULT_LANGUAGE}'.`);
};

/**
 * Replaces placeholders in a template string with provided data.
 * Placeholders are in the format {{ key }} or {{key}}.
 *
 * @param {string} template - The template string with placeholders
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
 * @param {string} [params.language] - The language code for the email template (optional, defaults to 'de')
 */
export const sendConfirmationRequest = (params) => {
  const {
    recipient,
    sender,
    confirmationUrl,
    senderName,
    language = DEFAULT_LANGUAGE
  } = params;

  if (!recipient) throw new Meteor.Error('invalid-param', 'recipient email is required');
  if (!sender) throw new Meteor.Error('invalid-param', 'sender email is required');
  if (!confirmationUrl) throw new Meteor.Error('invalid-param', 'confirmationUrl is required');

  const normalizedLanguage = validateLanguage(language);
  
  console.log(`Sending DOI confirmation email to ${recipient} [language: ${normalizedLanguage}]`);

  // Load and render email body
  const bodyTemplate = readEmailTemplate('doi-email', normalizedLanguage);
  const emailBody = renderTemplate(bodyTemplate, {
    confirmationUrl,
    senderName: senderName || sender,
    recipient,
    sender
  });

  // Load and render email subject
  const subjectTemplate = readEmailTemplate('doi-email-subject', normalizedLanguage);
  const subject = renderTemplate(subjectTemplate, {
    senderName: senderName || sender,
    recipient,
    sender
  }).trim();

  Email.send({
    to: recipient,
    from: sender,
    subject: subject,
    html: emailBody
  });

  console.log(`DOI confirmation email successfully sent to ${recipient} [language: ${normalizedLanguage}]`);
};
