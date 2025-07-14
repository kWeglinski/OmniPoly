



import { i18n } from 'i18next';

const backend = {
  type: 'backend',
  init: () => {},
  read: (language, namespace, callback) => {
    fetch(`/api/translations/${language}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          callback(data.error, null);
        } else {
          callback(null, data);
        }
      })
      .catch((error) => {
        console.error('Error loading translations:', error);
        callback(error, null);
      });
  },
  create: () => {},
  saveMissing: (lngs, namespace, key, fallbackValue) => {
    // Send missing translation to server
    fetch(`/api/translations/${lngs[0]}/${namespace}/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: fallbackValue }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          console.error('Error saving missing translation:', data.error);
        }
      })
      .catch((error) => {
        console.error('Error saving missing translation:', error);
      });
  }
};

export default backend;




