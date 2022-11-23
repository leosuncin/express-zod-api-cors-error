import {
  isErrorLike,
  serializeError,
} from 'https://cdn.skypack.dev/serialize-error';

const serverUrl = 'http://localhost:3010/hello';
const form = document.getElementById('request-form');

function restoreDisplay() {
  const displayResult = document.getElementById('display-result');
  displayResult.innerText = 'The response or error should appear here';
  displayResult.classList.replace('alert-success', 'alert-info') ||
    displayResult.classList.replace('alert-danger', 'alert-info');
}

function showResult(result) {
  const isError = isErrorLike(result);
  const displayResult = document.getElementById('display-result');
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

async function sendRequest(method, name) {
  const query = new URLSearchParams({ name });
  let result;

  try {
    const response = await fetch(
      method === 'GET' && name ? `${serverUrl}?${query}` : serverUrl,
      {
        method,
        ...(method !== 'GET' && name
          ? {
              headers: {
                'Content-Type': 'application/json',
              },
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

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const method = formData.get('_method');
  const name = formData.get('name').trim();
  await sendRequest(method, name);
});

form.addEventListener('reset', restoreDisplay);
