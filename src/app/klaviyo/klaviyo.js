const KLAVIYO_API_BASE_URL = process.env.KLAVIYO_API_BASE_URL;
const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_REVISION = process.env.KLAVIYO_REVISION;

// console.log("API", KLAVIYO_API_BASE_URL, KLAVIYO_API_KEY, KLAVIYO_REVISION);

async function fetchWithErrorHandling(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error: ${response.status} ${response.statusText}, ${JSON.stringify(error)}`);
  }
  return response;
}

 async function createProfile(user, customProperties) {
   try {
   
    const response = await fetchWithErrorHandling(`${KLAVIYO_API_BASE_URL}profile-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: user.email,
            first_name: `${user.firstName} ${user.lastName}`,
            properties: customProperties,
          },
        },
      }),
    });
    return response;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

 async function subscribeProfiles(user, listId) {
  try {
    const response = await fetchWithErrorHandling(`${KLAVIYO_API_BASE_URL}profile-subscription-bulk-create-jobs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
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
      }),
    });
    return response;
  } catch (error) {
    console.error('Error subscribing profiles:', error);
    throw error;
  }
}

 async function deleteProfileSubscription(user, listId) {
  try {
    const response = await fetchWithErrorHandling(`${KLAVIYO_API_BASE_URL}profile-subscription-bulk-delete-jobs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
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
      }),
    });
    return response;
  } catch (error) {
    console.error('Error deleting profile subscription:', error);
    throw error;
  }
}

 async function deleteProfile(user) {
  try {
    const response = await fetchWithErrorHandling(`${KLAVIYO_API_BASE_URL}data-privacy-deletion-jobs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
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
      }),
    });
    return response;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}

module.exports = {
  createProfile,
  subscribeProfiles,
  deleteProfile
};