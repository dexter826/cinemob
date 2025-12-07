import { Movie } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface AIRecommendation {
    title: string;
    reason: string;
}

export const getAIRecommendations = async (history: Movie[], allMovies: Movie[], excludePreviouslyRecommended: string[] = []): Promise<AIRecommendation[]> => {
    if (!history || history.length === 0) return [];

    // 1. Chuẩn bị dữ liệu lịch sử xem phim
    // Chỉ lấy phim được đánh giá cao (>= 3 sao)
    const filteredMovies = history.filter(m => (m.rating || 0) >= 3); // Chỉ lấy phim user thích

    // Hàm chọn ngẫu nhiên
    const getRandomItems = (array: Movie[], count: number): Movie[] => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    };

    const selectedMovies = getRandomItems(filteredMovies, 200); // Giới hạn 200 phim ngẫu nhiên

    const watchedList = selectedMovies
        .map(m => `${m.title} (${m.rating}/5 stars)`)
        .join('\n');

    // Danh sách phim đã có trong collection để loại trừ
    const existingTitles = allMovies.map(m => m.title).join(', ');

    // Danh sách phim đã gợi ý trước đó để loại trừ
    const previouslyRecommendedTitles = excludePreviouslyRecommended.join(', ');

    const prompt = `
    Based on the user's watched movie and TV series history below, recommend 22 similar movies or TV series that they haven't watched and are not already in their collection.

    User History:
    ${watchedList}

    Exclude these movies/TV series (already in user's collection):
    ${existingTitles}

    Also exclude these movies/TV series (previously recommended but not selected):
    ${previouslyRecommendedTitles}

    Return ONLY a JSON array with the following format, no other text:
    [
      { "title": "Movie/Series Name 1", "reason": "Short reason why" },
      { "title": "Movie/Series Name 2", "reason": "Short reason why" }
    ]
    The title must be the exact English or Original title for TMDB search.
  `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin, // Required by OpenRouter
                "X-Title": "CineMOB", // Optional
            },
            body: JSON.stringify({
                "model": "amazon/nova-2-lite-v1:free",
                "messages": [
                    { "role": "system", "content": "You are a helpful movie recommendation engine. You output valid JSON only." },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7,
                "reasoning": { "enabled": true }
            })
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const content = data.choices[0].message.content;
            // Làm sạch chuỗi JSON (đôi khi AI trả về markdown ```json ... ```)
            const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonString) as AIRecommendation[];
        }

        return [];
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return [];
    }
};
