import { Movie } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface AIRecommendation {
    title: string;
    reason: string;
}

interface CircuitBreakerState {
    failCount: number;
    lastFailTime: number;
    state: 'CLOSED' | 'OPEN';
}

const CIRCUIT_CONFIG = {
    FAIL_THRESHOLD: 5,
    RECOVERY_TIME: 60000, // 60 giây
} as const;

const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    BASE_DELAY: 2000, // 2 giây
} as const;

let circuitBreaker: CircuitBreakerState = {
    failCount: 0,
    lastFailTime: 0,
    state: 'CLOSED',
};

const isCircuitOpen = (): boolean => {
    if (circuitBreaker.state === 'CLOSED') return false;
    
    const timeSinceFail = Date.now() - circuitBreaker.lastFailTime;
    if (timeSinceFail > CIRCUIT_CONFIG.RECOVERY_TIME) {
        circuitBreaker = { failCount: 0, lastFailTime: 0, state: 'CLOSED' };
        return false;
    }
    return true;
};

const recordFailure = (): void => {
    circuitBreaker.failCount++;
    circuitBreaker.lastFailTime = Date.now();
    
    if (circuitBreaker.failCount >= CIRCUIT_CONFIG.FAIL_THRESHOLD) {
        circuitBreaker.state = 'OPEN';
    }
};

const recordSuccess = (): void => {
    circuitBreaker.failCount = 0;
    circuitBreaker.state = 'CLOSED';
};

/** Lấy gợi ý phim từ AI theo lịch sử xem. */
export const getAIRecommendations = async (history: Movie[], allMovies: Movie[], excludePreviouslyRecommended: string[] = []): Promise<AIRecommendation[]> => {
    if (!history || history.length === 0) return [];

    if (isCircuitOpen()) {
        console.warn("Circuit breaker OPEN: Too many API failures. Skipping AI recommendations.");
        throw new Error("CIRCUIT_BREAKER_OPEN");
    }

    return retryWithBackoff(() => callOpenRouterAPI(history, allMovies, excludePreviouslyRecommended));
};

const callOpenRouterAPI = async (history: Movie[], allMovies: Movie[], excludePreviouslyRecommended: string[]): Promise<AIRecommendation[]> => {
    const filteredMovies = history.filter(m => (m.rating || 0) >= 6);
    const selectedMovies = filteredMovies
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(150, filteredMovies.length)); 

    const watchedList = selectedMovies
        .map(m => `- ${m.title} (${m.rating ? m.rating + '/10 stars' : 'Liked'})`)
        .join('\n');

    const existingTitles = allMovies.map(m => m.title).join(', ');
    const previouslyRecommendedTitles = excludePreviouslyRecommended.join(', ');

    const prompt = `
    You are an expert Film Curator with deep knowledge of the TMDB database, cinematography, and storytelling structures.
    
    TASK:
    Analyze the user's movie history below to identify their "Taste Profile" (focus on preferred directors, narrative pacing, atmosphere, visual styles, and genres).
    Then, recommend 22 NEW movies/series that fit this profile perfectly.

    USER HISTORY (Analyze this):
    ${watchedList}

    STRICT RULES (Must Follow):
    1. NO DUPLICATES: You MUST NOT recommend any movie listed in the "Excluded Lists" below.
    2. CHECK ALIASES: Even if the English/Vietnamese title differs, do not recommend it if the movie is the same.
    3. SEARCHABILITY: The 'title' field MUST be the exact English name (or Original TMDB Title) so our API can find it.
    4. DIVERSITY: Don't just recommend sequels. Suggest similar "vibe" movies from different years or directors.
    5. QUALITY: Prioritize movies with good critical reception unless the user clearly loves "so bad it's good" movies.

    EXCLUDED LISTS (Do NOT recommend these):
    - Collection: ${existingTitles}
    - Previously Suggested: ${previouslyRecommendedTitles}

    OUTPUT FORMAT:
    Return ONLY a valid JSON array. No markdown formatting, no intro text.
    [
      { "title": "Exact TMDB Title", "reason": "Brief, insightful reason connecting to user's taste (e.g., 'Similar dark atmosphere to Batman')" },
      ...
    ]
    `;

    const response = await makeOpenRouterRequest(prompt);
    
    if (response.status === 429) {
        recordFailure();
        throw new Error("API_RATE_LIMIT");
    }

    const data = await response.json();

    if (data.error) {
        recordFailure();
        throw new Error(data.error.message || "API_ERROR");
    }

    if (!data.choices?.length) {
        recordFailure();
        return [];
    }

    try {
        const recommendations = parseAIResponse(data.choices[0].message.content);
        recordSuccess();
        return recommendations;
    } catch (error) {
        recordFailure();
        throw new Error("PARSE_ERROR");
    }
};

const sleep = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (
    fn: () => Promise<AIRecommendation[]>,
    retries: number = RETRY_CONFIG.MAX_RETRIES
): Promise<AIRecommendation[]> => {
    try {
        return await fn();
    } catch (error) {
        const shouldRetry = (error as Error).message === "API_RATE_LIMIT" && retries > 0;
        if (!shouldRetry) throw error;

        const delayMs = RETRY_CONFIG.BASE_DELAY * Math.pow(2, RETRY_CONFIG.MAX_RETRIES - retries);
        await sleep(delayMs);
        return retryWithBackoff(fn, retries - 1);
    }
};

const makeOpenRouterRequest = (prompt: string): Promise<Response> =>
    fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "CineMOB",
        },
        body: JSON.stringify({
            model: "minimax/minimax-m2.5:free",
            messages: [
                { role: "system", content: "You are a professional movie recommendation engine. Output valid JSON only." },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
        })
    });

const parseAIResponse = (content: string): AIRecommendation[] => {
    const jsonString = content
        .replace(/^```json\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
    return JSON.parse(jsonString);
}