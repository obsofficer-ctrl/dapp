import { Meteor } from 'meteor/meteor';
import { sendConfirmationRequest } from '../email/sendConfirmationRequest';

Meteor.methods({
  /**
   * Sends a DOI confirmation request email.
   * 
   * @param {object} params
   * @param {string} params.recipient - Email address of the opt-in recipient
   * @param {string} params.sender - Email address of the sender
   * @param {string} params.senderName - Name of the sender
   * @param {string} params.confirmationUrl - The DOI confirmation URL
   * @param {string} [params.language] - Language code for the email template (e.g. 'en', 'de', 'fr', 'it')
   */
  'doi.sendConfirmationRequest': function(params) {
    if (!this.isSimulation) {
      const {
        recipient,
        sender,
        senderName,
        confirmationUrl,
        language
      } = params;

      if (!recipient) throw new Meteor.Error('missing-param', 'recipient is required');
      if (!sender) throw new Meteor.Error('missing-param', 'sender is required');
      if (!confirmationUrl) throw new Meteor.Error('missing-param', 'confirmationUrl is required');

      sendConfirmationRequest({
        recipient,
        sender,
        senderName: senderName || sender,
        confirmationUrl,
        language: language || 'de'
      });
    }
  }
});
