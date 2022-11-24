import {
  isErrorLike,
  serializeError,
} from 'https://cdn.skypack.dev/serialize-error';

const serverUrl = 'http://localhost:3010/hello';
const form = document.getElementById('request-form');
const tokenButton = document.getElementById('generate-token');
const authorization = document.getElementById('authorization');

function restoreDisplay() {
  const displayResult = document.getElementById('display-result');
  displayResult.innerText = 'The response or error should appear here';
  displayResult.classList.replace('alert-success', 'alert-info') ||
    displayResult.classList.replace('alert-danger', 'alert-info');
}

function showResult(result) {
  const isError = isErrorLike(result);
  const displayResult = document.getElementById('display-result');

  if (displayResult.classList.contains('alert-danger') && !isError) {
    displayResult.classList.replace('alert-danger', 'alert-info');
  }

  displayResult.classList.replace(
    'alert-info',
    isError ? 'alert-danger' : 'alert-success',
  );
  displayResult.innerText = JSON.stringify(
    isError ? serializeError(result) : result,
    null,
    2,
  );
}

async function sendRequest(data) {
  const method = data.get('_method');
  const name = data.get('name').trim();
  const query = new URLSearchParams({ name });
  const headers = new Headers();
  let result;

  if (data.get('type')) {
    headers.set('Authorization', `${data.get('type')} ${data.get('token')}`);
  }

  if (method !== 'GET' && name) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(
      method === 'GET' && name ? `${serverUrl}?${query}` : serverUrl,
      {
        method,
        headers,
        ...(method !== 'GET' && name
          ? {
              body: JSON.stringify({ name }),
            }
          : {}),
      },
    );
    result = await response.json();
  } catch (error) {
    console.error(error);
    result = error;
  } finally {
    showResult(result);
  }
}

function generateToken() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const token = btoa(String.fromCharCode(...array));

  document.querySelector('[name=token]').value = token;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  await sendRequest(data);
});

form.addEventListener('reset', restoreDisplay);

authorization.addEventListener('change', (event) => {
  const type = event.target.value;
  const token = document.getElementById('token');

  if (type) {
    token.removeAttribute('disabled');
    tokenButton.removeAttribute('disabled');
    generateToken();
  } else {
    token.setAttribute('disabled', 'disabled');
    tokenButton.setAttribute('disabled', 'disabled');
  }
});

tokenButton.addEventListener('click', generateToken);
