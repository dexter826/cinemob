/**
 * Script GitHub Actions kiểm tra tập phim chiếu hôm nay và gửi Web Push.
 * Đọc TV series từ Firestore, kiểm tra TMDB cho các tập chiếu trong ngày, gửi push tới mọi thiết bị đã đăng ký.
 */

import admin from 'firebase-admin';
import webpush from 'web-push';
import { getPushSubscriptionForUser, removeExpiredSubscription } from './notification-targets.js';

// ============ Cấu hình ============
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const USER_UID = process.env.USER_UID;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:cinemob@example.com';

// ============ Khởi tạo Firebase Admin ============
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

// ============ Khởi tạo Web Push ============
const initWebPush = () => {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
};

// ============ Hàm Firestore ============
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
      season: data.season ?? null,
      status: data.status,
      genres: data.genres,
      country: data.country,
      release_date: data.release_date,
    };

    if (
      data.media_type === 'tv' &&
      data.status !== 'dropped' &&
      data.notifications_muted !== true
    ) {
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
  const subscriptions = await getPushSubscriptionForUser(db, USER_UID);

  console.log(`📱 Found ${subscriptions.length} push subscription(s) for configured user`);
  return subscriptions;
};

// ============ Hàm TMDB ============
const getTodayDateString = () => {
  // Giờ Việt Nam (UTC+7)
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
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
const getUpcomingEpisodes = async (tvId, season) => {
  try {
    const details = await fetchTMDB(`/tv/${tvId}`);
    if (details.status === 'Ended' || details.status === 'Canceled') return [];

    const now = new Date();
    const offset = 7 * 60 * 60 * 1000;
    const today = new Date(now.getTime() + offset).toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() + offset - 86400000).toISOString().split('T')[0];

    const isWestern = details.origin_country?.some((c) =>
      ['US', 'CA', 'GB', 'FR', 'DE', 'ES', 'IT'].includes(c),
    );
    const targetDate = isWestern ? yesterday : today;

    const matches = (episode) =>
      !!episode &&
      episode.air_date === targetDate &&
      (season == null || episode.season_number === season);
    const pick = (episode) => ({
      season_number: episode.season_number,
      episode_number: episode.episode_number,
      name: episode.name,
      air_date: episode.air_date,
    });
    const episodes = [];
    if (matches(details.next_episode_to_air)) episodes.push(pick(details.next_episode_to_air));
    const nextEp = details.next_episode_to_air;
    const lastEp = details.last_episode_to_air;
    const isSameEpisode =
      !!nextEp &&
      !!lastEp &&
      nextEp.season_number === lastEp.season_number &&
      nextEp.episode_number === lastEp.episode_number;
    if (matches(lastEp) && !isSameEpisode) episodes.push(pick(lastEp));
    return episodes;
  } catch (error) {
    return [];
  }
};

// ============ Hàm gửi thông báo ============
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

    // Subscription hết hạn/vô hiệu thì gỡ khỏi Firestore.
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log(`🗑️ Removing expired subscription ${subscription.id}`);
      const db = admin.firestore();
      await removeExpiredSubscription(db, subscription.id, error.statusCode);
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

// ============ Hàm chính ============
const main = async () => {
  console.log('🚀 Starting episode check...');
  console.log(`📅 Today: ${getTodayDateString()}`);

  // Kiểm tra biến môi trường
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

  // Khởi tạo Firebase và Web Push
  initFirebase();
  initWebPush();

  // Lấy danh sách push subscription
  const subscriptions = await getPushSubscriptions();
  if (subscriptions.length === 0) {
    console.log('📭 No push subscriptions found, skipping...');
    return;
  }

  // Lấy dữ liệu từ Firestore
  const { tvSeries, movies } = await getWatchlistFromFirestore();

  if (tvSeries.length === 0 && movies.length === 0) {
    console.log('📭 No items found in your collection');
    return;
  }

  const today = getTodayDateString();
  const todayEpisodes = [];
  const todayMovies = [];

  // Kiểm tra từng series xem hôm nay có tập không
  for (const series of tvSeries) {
    const episodes = await getUpcomingEpisodes(series.id, series.season);
    for (const episode of episodes) {
      todayEpisodes.push({ series, episode });
    }
  }
  const seenSeries = new Set();
  const uniqueTodayEpisodes = [];
  for (const entry of todayEpisodes) {
    const key = String(entry.series.id);
    if (seenSeries.has(key)) continue;
    seenSeries.add(key);
    uniqueTodayEpisodes.push(entry);
  }

  for (const movie of movies) {
    const country = movie.country || '';
    const isWestern = ['Mỹ', 'Anh', 'Pháp', 'USA', 'UK'].some((c) => country.includes(c));

    const now = new Date();
    const offset = 7 * 60 * 60 * 1000;
    const targetDate = isWestern
      ? new Date(now.getTime() + offset - 86400000).toISOString().split('T')[0]
      : today;

    if (movie.release_date === targetDate) todayMovies.push(movie);
  }

  // Hôm nay không có tập/phim nào thì dừng
  if (uniqueTodayEpisodes.length === 0 && todayMovies.length === 0) {
    console.log('📭 No episodes or movies airing today');
    return;
  }

  console.log(
    `\n🎬 Found ${uniqueTodayEpisodes.length} episode(s) and ${todayMovies.length} movie(s) today:`,
  );
  uniqueTodayEpisodes.forEach(({ series, episode }) => {
    const code = `Mùa ${episode.season_number} - Tập ${episode.episode_number}`;
    console.log(`  • [TV] ${series.title_vi || series.title} - ${code}`);
  });
  todayMovies.forEach((movie) => {
    console.log(`  • [Movie] ${movie.title_vi || movie.title}`);
  });

  // Soạn nội dung thông báo
  let title, body;

  if (uniqueTodayEpisodes.length + todayMovies.length === 1) {
    if (uniqueTodayEpisodes.length === 1) {
      const { series, episode } = uniqueTodayEpisodes[0];
      title = `🎬 ${series.title_vi || series.title}`;
      body = `Mùa ${episode.season_number} • Tập ${episode.episode_number} đã lên sóng!`;
    } else {
      const movie = todayMovies[0];
      title = `🍿 ${movie.title_vi || movie.title}`;
      body = `Phim chính thức khởi chiếu hôm nay!`;
    }
  } else {
    const total = uniqueTodayEpisodes.length + todayMovies.length;
    title = `🎬 Cinemob: ${total} phim mới hôm nay`;

    const items = [];
    uniqueTodayEpisodes.forEach(({ series, episode }) => {
      items.push(`${series.title_vi || series.title} (T.${episode.episode_number})`);
    });
    todayMovies.forEach((movie) => {
      items.push(`${movie.title_vi || movie.title} (Mới)`);
    });

    body = items.join(', ');
    if (body.length > 100) {
      body = body.substring(0, 97) + '...';
    }
  }

  // Gửi tới mọi subscription
  console.log(`\n📤 Sending push notifications...`);
  const successCount = await sendToAllSubscriptions(subscriptions, title, body);

  console.log(
    `\n🏁 Done! Sent ${successCount}/${subscriptions.length} notification(s) for ${uniqueTodayEpisodes.length} episode(s)`,
  );
};

// Chạy
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
