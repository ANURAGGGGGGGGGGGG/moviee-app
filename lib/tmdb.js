const MAX_ATTEMPTS = 4;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function tmdbFetch(url, init = {}) {
  let lastError;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS - 1) {
        await delay(150 * 2 ** attempt + Math.round(Math.random() * 150));
      }
    }
  }
  throw lastError;
}

export function describeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error && error.cause ? error.cause.message : "";
  if (/fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|network/i.test(`${message} ${cause}`)) {
    return "Could not reach TMDb. The connection was interrupted.";
  }
  return message;
}
