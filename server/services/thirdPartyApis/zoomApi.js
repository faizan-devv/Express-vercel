const { BadRequestError } = require('../../utils/errorTypes');
const axios = require('axios');
const qs = require('qs');

const revokeZoomToken = async (
  accessToken,
  clientId,
  clientSecret,
  revokeTokenUrl
) => {
  try {
    const revokeTokenResponse = await axios.post(
      revokeTokenUrl,
      qs.stringify({
        token: accessToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString('base64')}`,
        },
      }
    );

    const { data } = await revokeTokenResponse;
    if (data.status !== 'success') throw new BadRequestError('Token Expired');
    return { data };
  } catch (error) {
    throw new Error(error);
  }
};

const refreshZoomToken = async (
  zoomOAuthEndpoint,
  clientId,
  clientSecret,
  currentRefreshToken
) => {
  try {
    const zoomRefreshTokenRequest = await axios.post(
      zoomOAuthEndpoint,
      qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: currentRefreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString('base64')}`,
        },
      }
    );

    const { data } = await zoomRefreshTokenRequest;
    const { access_token, refresh_token } = data;

    return { access_token, refresh_token };
  } catch (error) {
    throw new Error(error);
  }
};
const getZoomToken = async (
  zoomOAuthEndpoint,
  zoomRedirectUrl,
  accountId,
  clientId,
  clientSecret,
  code
) => {
  try {
    const request = await axios.post(
      zoomOAuthEndpoint,
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: zoomRedirectUrl,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString('base64')}`,
        },
      }
    );

    const { access_token, expires_in, refresh_token } = await request.data;

    return { access_token, expires_in, refresh_token, error: null };
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const setZoomMeeting = async (zoomApiBaseUrl, token, body) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  try {
    const request = await axios.post(
      `${zoomApiBaseUrl}/users/me/meetings`,
      body,
      {
        params: {
          status: 'active',
        },
        headers,
        withCredentials: true,
      }
    );
    return request.data;
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const updateZoomMeeting = async (zoomApiBaseUrl, token, body, meetingId) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  try {
    const request = await axios.patch(
      `${zoomApiBaseUrl}/meetings/${meetingId}`,
      body,
      {
        params: {
          status: 'active',
        },
        headers,
        withCredentials: true,
      }
    );
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const deleteZoomMeeting = async (zoomApiBaseUrl, token, meetingId) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  try {
    const request = await axios.delete(
      `${zoomApiBaseUrl}/meetings/${meetingId}`,
      {
        params: {
          status: 'active',
        },
        headers,
        withCredentials: true,
      }
    );
    return request.data;
  } catch (error) {
    throw new BadRequestError(error);
  }
};

module.exports = {
  revokeZoomToken,
  refreshZoomToken,
  getZoomToken,
  setZoomMeeting,
  deleteZoomMeeting,
  updateZoomMeeting,
};
