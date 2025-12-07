import { Movie } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface AIRecommendation {
    title: string;
    reason: string;
}

export const getAIRecommendations = async (history: Movie[], allMovies: Movie[], excludePreviouslyRecommended: string[] = []): Promise<AIRecommendation[]> => {
    if (!history || history.length === 0) return [];

    // Chuẩn bị dữ liệu: Chỉ lấy phim user thích (Rating >= 3 hoặc phim trong watchlist chưa có rating)
    const filteredMovies = history.filter(m => (m.rating || 0) >= 3);

    // Hàm chọn ngẫu nhiên
    const getRandomItems = (array: Movie[], count: number): Movie[] => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    };

    const selectedMovies = getRandomItems(filteredMovies, 150); 

    const watchedList = selectedMovies
        .map(m => `- ${m.title} (${m.rating ? m.rating + '/5 stars' : 'Liked'})`)
        .join('\n');

    // Danh sách loại trừ
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

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin, 
                "X-Title": "CineMOB", 
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3.3-70b-instruct:free", 
                "messages": [
                    { "role": "system", "content": "You are a professional movie recommendation engine. Output valid JSON only." },
                    { "role": "user", "content": prompt }
                ],
                // Giảm temperature để AI tuân thủ luật loại trừ tốt hơn
                "temperature": 0.5, 
            })
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const content = data.choices[0].message.content;
            // Xử lý làm sạch JSON triệt để hơn
            const jsonString = content
                .replace(/^```json\s*/, '') // Xóa ```json ở đầu
                .replace(/^```\s*/, '')     // Xóa ``` ở đầu
                .replace(/\s*```$/, '')     // Xóa ``` ở cuối
                .trim();
                
            return JSON.parse(jsonString) as AIRecommendation[];
        }

        return [];
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return [];
    }
};