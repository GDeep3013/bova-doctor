import axios from 'axios';

const KLAVIYO_API_BASE_URL = 'https://a.klaviyo.com/api/';
const KLAVIYO_API_KEY = 'pk_a78bbe87edb7bcb4eafa6ee141c04f2896';
const KLAVIYO_REVISION = '2024-07-15';


export async function createProfile(user, customProperties) {
  try {
    const response = await axios.post(
      `${KLAVIYO_API_BASE_URL}profile-import`,
      {
        data: {
          type: 'profile',
          attributes: {
            email: user.email,
            first_name: `${user.firstName} ${user.lastName}`,
            properties: customProperties,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          revision: KLAVIYO_REVISION,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}


export async function subscribeProfiles(user, listId) {
  try {
    const response = await axios.post(
      `${KLAVIYO_API_BASE_URL}profile-subscription-bulk-create-jobs/`,
      {
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            custom_source: 'Marketing Event',
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email: user.email,
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: 'SUBSCRIBED',
                        },
                      },
                    },
                  },
                },
              ],
            },
            historical_import: false,
          },
          relationships: {
            list: {
              data: {
                type: 'list',
                id: listId,
              },
            },
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          revision: KLAVIYO_REVISION,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error subscribing profiles:', error);
    throw error;
  }
}


export async function deleteProfileSubscription(user, listId) {
  try {
    const response = await axios.post(
      `${KLAVIYO_API_BASE_URL}profile-subscription-bulk-delete-jobs/`,
      {
        data: {
          type: 'profile-subscription-bulk-delete-job',
          attributes: {
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email: user.email,
                  },
                },
              ],
            },
          },
          relationships: {
            list: {
              data: {
                type: 'list',
                id: listId,
              },
            },
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          revision: KLAVIYO_REVISION,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting profile subscription:', error);
    throw error;
  }
}


export async function deleteProfile(user) {
  try {
    const response = await axios.post(
      `${KLAVIYO_API_BASE_URL}data-privacy-deletion-jobs/`,
      {
        data: {
          type: 'data-privacy-deletion-job',
          attributes: {
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email: user.email,
                },
              },
            },
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          revision: KLAVIYO_REVISION,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}
