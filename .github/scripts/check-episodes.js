/**
 * GitHub Actions script to check today's episodes and send ntfy notifications
 * Reads TV series from Firestore, checks TMDB for today's episodes
 */

import admin from 'firebase-admin';

// ============ Configuration ============
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const NTFY_TOPIC = process.env.NTFY_TOPIC;
const USER_UID = process.env.USER_UID;

// ============ Initialize Firebase Admin ============
const initFirebase = () => {
    if (admin.apps.length > 0) return;

    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
    });
};

// ============ Firestore Functions ============
const getTVSeriesFromFirestore = async () => {
    const db = admin.firestore();
    const snapshot = await db
        .collection('movies')
        .where('uid', '==', USER_UID)
        .where('media_type', '==', 'tv')
        .where('source', '==', 'tmdb')
        .get();

    const series = [];
    snapshot.forEach((doc) => {
        const data = doc.data();
        series.push({
            id: data.id,
            title: data.title,
            title_vi: data.title_vi || '',
            poster_path: data.poster_path,
        });
    });

    console.log(`📺 Found ${series.length} TV series in Firestore`);
    return series;
};

// ============ TMDB Functions ============
const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const fetchTMDB = async (endpoint) => {
    const url = `https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }
    return response.json();
};

const getUpcomingEpisodes = async (tvId) => {
    try {
        const details = await fetchTMDB(`/tv/${tvId}`);

        // Check if show is still running
        if (details.status === 'Ended' || details.status === 'Canceled') {
            return [];
        }

        const episodes = [];
        const today = getTodayDateString();

        // Check next episode
        if (details.next_episode_to_air) {
            const nextEp = details.next_episode_to_air;
            if (nextEp.air_date === today) {
                episodes.push({
                    season_number: nextEp.season_number,
                    episode_number: nextEp.episode_number,
                    name: nextEp.name,
                    air_date: nextEp.air_date,
                });
            }
        }

        // Also check last episode (sometimes next_episode_to_air is not updated immediately)
        if (details.last_episode_to_air) {
            const lastEp = details.last_episode_to_air;
            if (lastEp.air_date === today) {
                const alreadyAdded = episodes.some(
                    (e) => e.season_number === lastEp.season_number && e.episode_number === lastEp.episode_number
                );
                if (!alreadyAdded) {
                    episodes.push({
                        season_number: lastEp.season_number,
                        episode_number: lastEp.episode_number,
                        name: lastEp.name,
                        air_date: lastEp.air_date,
                    });
                }
            }
        }

        return episodes;
    } catch (error) {
        console.error(`❌ Error fetching episodes for TV ${tvId}:`, error.message);
        return [];
    }
};

// ============ Notification Functions ============
const sendNtfyNotification = async (title, body, options = {}) => {
    if (!NTFY_TOPIC) {
        console.warn('⚠️ NTFY_TOPIC not configured');
        return false;
    }

    try {
        const payload = {
            topic: NTFY_TOPIC,
            title: title,
            message: body,
            priority: options.priority || 4,
            tags: options.tags || ['clapper'],
        };

        const response = await fetch('https://ntfy.sh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log(`✅ Notification sent: ${title}`);
            return true;
        } else {
            console.error(`❌ Failed to send notification: ${response.statusText}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending notification:', error.message);
        return false;
    }
};

// ============ Main Function ============
const main = async () => {
    console.log('🚀 Starting episode check...');
    console.log(`📅 Today: ${getTodayDateString()}`);

    // Validate environment variables
    if (!TMDB_API_KEY || !NTFY_TOPIC || !USER_UID) {
        console.error('❌ Missing required environment variables');
        console.error('Required: TMDB_API_KEY, NTFY_TOPIC, USER_UID');
        process.exit(1);
    }

    // Initialize Firebase
    initFirebase();

    // Get TV series from Firestore
    const tvSeries = await getTVSeriesFromFirestore();

    if (tvSeries.length === 0) {
        console.log('📭 No TV series found in your collection');
        return;
    }

    // Check each series for today's episodes
    let notificationsSent = 0;
    const todayEpisodes = [];

    for (const series of tvSeries) {
        const episodes = await getUpcomingEpisodes(series.id);

        for (const episode of episodes) {
            todayEpisodes.push({
                series,
                episode
            });
        }
    }

    // If no episodes today, exit
    if (todayEpisodes.length === 0) {
        console.log('📭 No episodes airing today');
        return;
    }

    // Send notification(s)
    if (todayEpisodes.length === 1) {
        // Single episode - detailed notification
        const { series, episode } = todayEpisodes[0];
        const seriesName = series.title_vi || series.title;
        const episodeCode = `S${String(episode.season_number).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')}`;

        const title = `${seriesName}`;
        const body = `${episodeCode} • ${episode.name}`;

        const success = await sendNtfyNotification(title, body, {
            priority: 4,
        });

        if (success) notificationsSent++;
    } else {
        // Multiple episodes - summary notification
        const title = `📺 ${todayEpisodes.length} tập phim mới hôm nay`;

        const episodeLines = todayEpisodes.map(({ series, episode }) => {
            const name = series.title_vi || series.title;
            const code = `S${String(episode.season_number).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')}`;
            return `• ${name} (${code})`;
        }).join('\n');

        const success = await sendNtfyNotification(title, episodeLines, {
            priority: 4,
        });

        if (success) notificationsSent++;
    }

    console.log(`\n🏁 Done! Sent ${notificationsSent} notification(s) for ${todayEpisodes.length} episode(s)`);
};

// Run
main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
