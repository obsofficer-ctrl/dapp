import { Meteor } from 'meteor/meteor';
import { sendConfirmationRequest } from '../email/sendConfirmationRequest';

const DEFAULT_LANGUAGE = 'de';

/**
 * Processes an incoming DOI request.
 * Reads recipient details, constructs confirmation URL,
 * and sends the confirmation email in the requested language.
 *
 * @param {object} doiRequest
 * @param {string} doiRequest.recipient - The recipient's email
 * @param {string} doiRequest.sender - The sender's email
 * @param {string} doiRequest.senderName - The sender's display name
 * @param {string} doiRequest.confirmationUrl - The URL for email confirmation
 * @param {string} [doiRequest.language] - Language code for the email (e.g. 'en', 'de', 'fr', 'it')
 */
export const processDoiRequest = (doiRequest) => {
  const {
    recipient,
    sender,
    senderName,
    confirmationUrl,
    language = DEFAULT_LANGUAGE
  } = doiRequest;

  console.log(`Processing DOI request for ${recipient} from ${sender} [language: ${language}]`);

  sendConfirmationRequest({
    recipient,
    sender,
    senderName: senderName || sender,
    confirmationUrl,
    language
  });

  return true;
};
