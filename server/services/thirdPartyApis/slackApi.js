const { BadRequestError } = require('../../utils/errorTypes');
const axios = require('axios');
const qs = require('qs');

const sendSlackMessage = async (token, channel, message) => {
  try {
    const request = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel,
        text: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { access_token, incoming_webhook } = await request.data;
    if (request.data.error) throw new BadRequestError(request.data.error);

    return { access_token, incoming_webhook };
  } catch (error) {
    throw new BadRequestError(error);
  }
};
const getSlackToken = async (
  slackOAuthTokenURL,
  clientId,
  clientSecret,
  code
) => {
  try {
    const form = new FormData();
    form.append('code', code);
    form.append('client_id', clientId);
    form.append('client_secret', clientSecret);
    const request = await axios.post(slackOAuthTokenURL, form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, authed_user } = await request.data;
    if (request.data.error)
      throw new BadRequestError(request.data.error.message);

    return { access_token, authed_user };
  } catch (error) {
    throw new BadRequestError(error);
  }
};

module.exports = {
  sendSlackMessage,
  getSlackToken,
};
