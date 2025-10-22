export async function fetchJson<T>(
  url: string,
  options?: RequestInit,
  maxAttempts: number = 5,
  initialDelay: number = 500
): Promise<T> {
  console.log(`FetchJson: Fetching URL: ${url} with options: ${JSON.stringify(options)}`);
  let delay: number = initialDelay;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response: Response = await fetch(url, options);
      if (!response.ok) {
        const errorData: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `FetchJson: Failed to fetch: ${response.status}`);
      }
      return await response.json() as T;
    } catch (error) {
      if (attempt + 1 >= maxAttempts) throw new Error("FetchJson: Error fetching data. Please try again later.");
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("FetchJson: Unexpected error when fetching data.");
}