/**
 * GitHub Actions script to check today's episodes and send Web Push notifications
 * Reads TV series from Firestore, checks TMDB for today's episodes
 * Sends Web Push to all subscribed devices
 */

import admin from 'firebase-admin';
import webpush from 'web-push';

// ============ Configuration ============
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const USER_UID = process.env.USER_UID;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:cinemob@example.com';

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

// ============ Initialize Web Push ============
const initWebPush = () => {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
};

// ============ Firestore Functions ============
const getWatchlistFromFirestore = async () => {
    const db = admin.firestore();
    const snapshot = await db
        .collection('movies')
        .where('uid', '==', USER_UID)
        .where('source', '==', 'tmdb')
        .get();

    const tvSeries = [];
    const movies = [];

    snapshot.forEach((doc) => {
        const data = doc.data();
        const item = {
            id: data.id,
            title: data.title,
            title_vi: data.title_vi || '',
            poster_path: data.poster_path,
            media_type: data.media_type,
            status: data.status,
            genres: data.genres,
            country: data.country,
            release_date: data.release_date,
        };

        if (data.media_type === 'tv') {
            tvSeries.push(item);
        } else if (data.media_type === 'movie' && data.status === 'watchlist') {
            movies.push(item);
        }
    });

    console.log(`📺 Found ${tvSeries.length} TV series and ${movies.length} movies in watchlist`);
    return { tvSeries, movies };
};

const getPushSubscriptions = async () => {
    const db = admin.firestore();
    const snapshot = await db.collection('push_subscriptions').get();

    const subscriptions = [];
    snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.endpoint && data.keys) {
            subscriptions.push({
                id: doc.id,
                endpoint: data.endpoint,
                keys: data.keys,
            });
        }
    });

    console.log(`📱 Found ${subscriptions.length} push subscription(s)`);
    return subscriptions;
};

// ============ TMDB Functions ============
const getTodayDateString = () => {
    // Get current time in Vietnam (UTC+7)
    const now = new Date();
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return vnTime.toISOString().split('T')[0];
};

const fetchTMDB = async (endpoint) => {
    const url = `https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }
    return response.json();
};

/** Lấy danh sách tập phim phát sóng dựa trên múi giờ quốc gia. */
const getUpcomingEpisodes = async (tvId) => {
    try {
        const details = await fetchTMDB(`/tv/${tvId}`);
        if (details.status === 'Ended' || details.status === 'Canceled') return [];

        const episodes = [];
        const now = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const today = new Date(now.getTime() + offset).toISOString().split('T')[0];
        const yesterday = new Date(now.getTime() + offset - 86400000).toISOString().split('T')[0];

        const isWestern = details.origin_country?.some(c => ['US', 'CA', 'GB', 'FR', 'DE', 'ES', 'IT'].includes(c));
        const targetDate = isWestern ? yesterday : today;

        if (details.next_episode_to_air?.air_date === targetDate) {
            const nextEp = details.next_episode_to_air;
            episodes.push({
                season_number: nextEp.season_number,
                episode_number: nextEp.episode_number,
                name: nextEp.name,
                air_date: nextEp.air_date,
            });
        }

        if (details.last_episode_to_air?.air_date === targetDate) {
            const lastEp = details.last_episode_to_air;
            if (!episodes.some(e => e.season_number === lastEp.season_number && e.episode_number === lastEp.episode_number)) {
                episodes.push({
                    season_number: lastEp.season_number,
                    episode_number: lastEp.episode_number,
                    name: lastEp.name,
                    air_date: lastEp.air_date,
                });
            }
        }
        return episodes;
    } catch (error) {
        return [];
    }
};

// ============ Notification Functions ============
const sendWebPushNotification = async (subscription, payload) => {
    try {
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
        };

        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        console.log(`✅ Push sent to subscription ${subscription.id}`);
        return true;
    } catch (error) {
        console.error(`❌ Push failed for ${subscription.id}:`, error.message);

        // If subscription is expired/invalid, remove it from Firestore
        if (error.statusCode === 404 || error.statusCode === 410) {
            console.log(`🗑️ Removing expired subscription ${subscription.id}`);
            const db = admin.firestore();
            await db.collection('push_subscriptions').doc(subscription.id).delete();
        }

        return false;
    }
};

const sendToAllSubscriptions = async (subscriptions, title, body) => {
    const payload = {
        title: title,
        body: body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'cinemob-episode',
        data: {
            url: '/',
        },
    };

    let successCount = 0;
    for (const subscription of subscriptions) {
        const success = await sendWebPushNotification(subscription, payload);
        if (success) successCount++;
    }

    return successCount;
};

// ============ Main Function ============
const main = async () => {
    console.log('🚀 Starting episode check...');
    console.log(`📅 Today: ${getTodayDateString()}`);

    // Validate environment variables
    if (!TMDB_API_KEY || !USER_UID) {
        console.error('❌ Missing required environment variables');
        console.error('Required: TMDB_API_KEY, USER_UID');
        process.exit(1);
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.error('❌ Missing VAPID keys for Web Push');
        console.error('Required: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY');
        process.exit(1);
    }

    // Initialize Firebase and Web Push
    initFirebase();
    initWebPush();

    // Get push subscriptions
    const subscriptions = await getPushSubscriptions();
    if (subscriptions.length === 0) {
        console.log('📭 No push subscriptions found, skipping...');
        return;
    }

    // Get items from Firestore
    const { tvSeries, movies } = await getWatchlistFromFirestore();

    if (tvSeries.length === 0 && movies.length === 0) {
        console.log('📭 No items found in your collection');
        return;
    }

    const today = getTodayDateString();
    const todayEpisodes = [];
    const todayMovies = [];

    // Check each series for today's episodes
    for (const series of tvSeries) {
        const episodes = await getUpcomingEpisodes(series.id);
        for (const episode of episodes) {
            todayEpisodes.push({ series, episode });
        }
    }

    for (const movie of movies) {
        const country = movie.country || '';
        const isWestern = ['Mỹ', 'Anh', 'Pháp', 'USA', 'UK'].some(c => country.includes(c));
        
        const now = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const targetDate = isWestern 
            ? new Date(now.getTime() + offset - 86400000).toISOString().split('T')[0]
            : today;

        if (movie.release_date === targetDate) todayMovies.push(movie);
    }

    // If no episodes or movies today, exit
    if (todayEpisodes.length === 0 && todayMovies.length === 0) {
        console.log('📭 No episodes or movies airing today');
        return;
    }

    console.log(`\n🎬 Found ${todayEpisodes.length} episode(s) and ${todayMovies.length} movie(s) today:`);
    todayEpisodes.forEach(({ series, episode }) => {
        const code = `Mùa ${episode.season_number} - Tập ${episode.episode_number}`;
        console.log(`  • [TV] ${series.title_vi || series.title} - ${code}`);
    });
    todayMovies.forEach((movie) => {
        console.log(`  • [Movie] ${movie.title_vi || movie.title}`);
    });

    // Build notification content
    let title, body;

    if (todayEpisodes.length + todayMovies.length === 1) {
        if (todayEpisodes.length === 1) {
            const { series, episode } = todayEpisodes[0];
            title = `🎬 Lịch chiếu: ${series.title_vi || series.title}`;
            body = `Hôm nay phát sóng Mùa ${episode.season_number} • Tập ${episode.episode_number}. Đừng bỏ lỡ nhé!`;
        } else {
            const movie = todayMovies[0];
            title = `🍿 Khởi chiếu: ${movie.title_vi || movie.title}`;
            body = `Bộ phim bạn mong đợi đã chính thức ra mắt hôm nay!`;
        }
    } else {
        const total = todayEpisodes.length + todayMovies.length;
        title = `🎬 Cinemob: Lịch chiếu hôm nay (${total} phim)`;

        const lines = [];
        todayEpisodes.slice(0, 3).forEach(({ series, episode }) => {
            lines.push(`• ${series.title_vi || series.title} (Tập ${episode.episode_number})`);
        });
        todayMovies.slice(0, 2).forEach((movie) => {
            lines.push(`• ${movie.title_vi || movie.title} (Khởi chiếu)`);
        });

        if (total > lines.length) {
            lines.push(`... và ${total - lines.length} nội dung khác`);
        }
        body = lines.join('\n');
    }

    // Send to all subscriptions
    console.log(`\n📤 Sending push notifications...`);
    const successCount = await sendToAllSubscriptions(subscriptions, title, body);

    console.log(`\n🏁 Done! Sent ${successCount}/${subscriptions.length} notification(s) for ${todayEpisodes.length} episode(s)`);
};

// Run
main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
