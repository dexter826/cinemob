import { Movie } from '@/types';
import { AI_PROXY_URL } from '@/constants';
import { normalizeMovieDate } from '../utils/movieUtils';

interface AIRecommendation {
  title: string;
  reason: string;
}

const RETRY_DELAY_MS = 2000;

// Lấy phim gợi ý từ AI theo lịch sử xem.
export const getAIRecommendations = async (
  history: Movie[],
  allMovies: Movie[],
): Promise<AIRecommendation[]> => {
  if (!history || history.length === 0) return [];
  return retryOnRateLimit(() => callAIProxyAPI(history, allMovies));
};

const callAIProxyAPI = async (
  history: Movie[],
  allMovies: Movie[],
): Promise<AIRecommendation[]> => {
  const filteredMovies = history.filter((m) => (m.rating || 0) >= 4);
  const selectedMovies = filteredMovies
    .sort((a, b) => {
      const timeA = normalizeMovieDate(a.watched_at)?.getTime() || 0;
      const timeB = normalizeMovieDate(b.watched_at)?.getTime() || 0;
      return timeB - timeA;
    })
    .slice(0, 50);

  const watchedList = selectedMovies
    .map((m) => `- ${m.title} (${m.rating ? m.rating + '/10 stars' : 'Liked'})`)
    .join('\n');

  const existingTitles = allMovies.map((m) => m.title).join(', ');

  const prompt = `
    You are an expert Film Curator. Analyze the user's movie history to identify their taste (directors, atmosphere, genres).
    Recommend 22 NEW movies/series that fit this profile.

    USER HISTORY (Last 50 movies):
    ${watchedList}

    STRICT RULES:
    1. NO DUPLICATES: Do not recommend anything from the Excluded Lists.
    2. EXACT TITLES: Use exact English/Original titles and include the RELEASE YEAR for accuracy.
    3. SEARCHABILITY: Format: "Movie Title (Year)".
    4. DIVERSITY: Mix genres and eras based on the user's profile.

    EXCLUDED LISTS (Do NOT recommend):
    - Collection: ${existingTitles}

    OUTPUT FORMAT:
    Return ONLY a valid JSON array. No markdown formatting, no intro text.
    [
      { "title": "Exact TMDB Title", "reason": "Brief, insightful reason connecting to user's taste (e.g., 'Similar dark atmosphere to Batman')" },
      ...
    ]
    `;

  const response = await makeAIProxyRequest(prompt);

  if (!response.ok) {
    if (response.status === 429) throw new Error('API_RATE_LIMIT');
    throw new Error(`API_ERROR_${response.status}`);
  }

  const data = await response.json();

  if (data.error) throw new Error(data.error.message || 'API_ERROR');
  if (!data.choices?.length) return [];

  try {
    return parseAIResponse(data.choices[0].message.content);
  } catch {
    throw new Error('PARSE_ERROR');
  }
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Thử lại đúng một lần khi bị rate limit.
const retryOnRateLimit = async (
  fn: () => Promise<AIRecommendation[]>,
): Promise<AIRecommendation[]> => {
  try {
    return await fn();
  } catch (error) {
    if ((error as Error).message !== 'API_RATE_LIMIT') throw error;
    await sleep(RETRY_DELAY_MS);
    return fn();
  }
};

const makeAIProxyRequest = (prompt: string): Promise<Response> =>
  fetch(`${AI_PROXY_URL}/v1/chat/completions`, {
    method: 'POST',
    signal: AbortSignal.timeout(60000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [
        {
          role: 'system',
          content: 'You are a professional movie recommendation engine. Output valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    }),
  });

const parseAIResponse = (content: string): AIRecommendation[] => {
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('NO_JSON_ARRAY');
  const parsed: unknown = JSON.parse(match[0]);
  if (!Array.isArray(parsed)) throw new Error('NO_JSON_ARRAY');
  return parsed.filter(
    (item): item is AIRecommendation =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as AIRecommendation).title === 'string',
  );
};
